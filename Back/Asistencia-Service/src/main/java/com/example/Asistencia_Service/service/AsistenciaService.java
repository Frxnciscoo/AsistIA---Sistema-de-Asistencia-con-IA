package com.example.Asistencia_Service.service;

import com.example.Asistencia_Service.client.UserServiceClient;
import com.example.Asistencia_Service.client.pythonClient;
import com.example.Asistencia_Service.dto.*;
import com.example.Asistencia_Service.entidad.Asistencia;
import com.example.Asistencia_Service.entidad.TiposRegistro;
import com.example.Asistencia_Service.mapper.AsistenciaMapper;
import com.example.Asistencia_Service.repository.AsistenciaRepository;
import com.example.Asistencia_Service.repository.TiposRegistroRepository;
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class AsistenciaService {

    private static final Logger logger = LoggerFactory.getLogger(AsistenciaService.class);

    private final AsistenciaRepository asistenciaRepository;

    @Autowired
    private pythonClient pythonClient;

    private final AsistenciaMapper asistenciaMapper;

    private final TiposRegistroRepository tiposRegistroRepository;

    private final UserServiceClient userServiceClient;

    public AsistenciaService(AsistenciaRepository asistenciaRepository, AsistenciaMapper asistenciaMapper, 
                             TiposRegistroRepository tiposRegistroRepository, UserServiceClient userServiceClient) {
        this.asistenciaRepository = asistenciaRepository;
        this.asistenciaMapper = asistenciaMapper;
        this.tiposRegistroRepository = tiposRegistroRepository;
        this.userServiceClient = userServiceClient;
    }

    public AsistenciaDtoResponse registrarAsistencia(Long idUsuario, AsistenciaDtoCreate dto) {
        return registrarAsistenciaInterno(idUsuario, dto, null);
    }

    // ← MÉTODO PRIVADO PARA EVITAR DUPLICACIÓN
    private AsistenciaDtoResponse registrarAsistenciaInterno(Long idUsuario, AsistenciaDtoCreate dto, String nombreUsuario) {

        HorarioAsinadoDto horarioAsignado;
        try {
            horarioAsignado = userServiceClient.obtenerHorarioActual(idUsuario);
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("El usuario con ID " + idUsuario + " no tiene un horario asignado para hoy.");
        }

        LocalTime horaActual = LocalTime.now();
        LocalTime horaEntrada = horarioAsignado.horaEntrada();

        LocalTime horaInicioPermitida = horaEntrada.minusMinutes(60);
        LocalTime horaLimiteTardanza = horaEntrada.plusMinutes(horarioAsignado.toleranciaMin());

        String estadoCalculado;

        if (horaActual.isBefore(horaInicioPermitida)) {
            throw new RuntimeException("Es demasiado temprano para marcar asistencia. Tu entrada es a las: " + horaEntrada);
        } else if (horaActual.isAfter(horaLimiteTardanza)) {
            estadoCalculado = "TARDE";
        } else {
            estadoCalculado = "PUNTUAL";
        }

        String tipoEventoAcabado = dto.tipoEvento() + " - " + estadoCalculado;

        TiposRegistro registroID = tiposRegistroRepository.findById(dto.idTipoRegistro())
                .orElseThrow(() -> new RuntimeException("El Id no ha sido encontrado"));

        Asistencia asistencia = asistenciaMapper.toEntity(dto);
        asistencia.setIdUsuario(idUsuario);
        asistencia.setTiposRegistro(registroID);
        asistencia.setFecha(LocalDate.now());
        asistencia.setHoraRegistro(LocalTime.now());
        asistencia.setTipoEvento(tipoEventoAcabado);

        Asistencia asistenciaConDatos = asistenciaRepository.save(asistencia);

        return new AsistenciaDtoResponse(
                asistenciaConDatos.getIdAsistencia(),
                asistenciaConDatos.getIdUsuario(),
                asistenciaConDatos.getFecha(),
                asistenciaConDatos.getHoraRegistro(),
                asistenciaConDatos.getTipoEvento(),
                registroID.getNombreTipo(),
                true,
                nombreUsuario != null ? nombreUsuario : "Usuario",
                asistenciaConDatos.getFechaRegistro()
        );
    }

        // ← ÚNICO MÉTODO: Para reconocimiento facial (sin duplicación)
    public AsistenciaDtoResponse registrarPorReconocimiento(AsistenciaFacialDto dtoFacial) {
        logger.info("🔍 Procesando reconocimiento facial con ruta: {}", dtoFacial.rutaImagen());
        
        IaRequestDto requestIa = new IaRequestDto(dtoFacial.rutaImagen());
        IaResponseDto respuestaIa = pythonClient.reconocerRostro(requestIa);

        if (respuestaIa.personas() == null || respuestaIa.personas().isEmpty()) {
            logger.error("❌ Rostro no reconocido");
            throw new RuntimeException("Rostro no reconocido o imagen inválida.");
        }

        String dniDetectado = respuestaIa.personas().getFirst();
        logger.info("✅ DNI detectado por IA: {}", dniDetectado);

        // ← PASO 1: Obtener ID del usuario por DNI (esto ya funcionaba)
        Long idUsuario;
        try {
            idUsuario = userServiceClient.obtenerIdPorDni(dniDetectado);
            logger.info("✅ Usuario ID encontrado: {}", idUsuario);
        } catch (Exception e) {
            logger.error("❌ Error buscando usuario por DNI {}: {}", dniDetectado, e.getMessage());
            throw new RuntimeException("La IA reconoció el DNI " + dniDetectado + ", pero no existe ese usuario en la base de datos.");
        }

        // ← PASO 2: Obtener datos completos del usuario (incluyendo nombre)
        String nombreUsuario = "Usuario";
        try {
            UserResponseDto usuarioDto = userServiceClient.obtenerUsuarioPorId(idUsuario);
            nombreUsuario = usuarioDto.nombre();
            logger.info("✅ Usuario encontrado: {} (ID: {})", nombreUsuario, idUsuario);
        } catch (Exception e) {
            logger.warn("⚠️ No se pudo obtener nombre del usuario, usando nombre genérico: {}", e.getMessage());
        }

        // ← PASO 3: Validar que el usuario tenga horario asignado ANTES de registrar
        try {
            userServiceClient.obtenerHorarioActual(idUsuario);
            logger.info("✅ Usuario {} tiene horario asignado", nombreUsuario);
        } catch (Exception e) {
            logger.error("❌ El usuario {} NO tiene horario asignado para hoy", nombreUsuario);
            throw new RuntimeException("El usuario " + nombreUsuario + " no tiene un horario asignado para hoy. Contacte con administración.");
        }

        AsistenciaDtoCreate dtoAutomatico = new AsistenciaDtoCreate(
                dtoFacial.tipoEvento(),
                2L
        );
        
        // ← PASO 4: Registrar asistencia con el nombre del usuario
        return registrarAsistenciaInterno(idUsuario, dtoAutomatico, nombreUsuario);
    }
}