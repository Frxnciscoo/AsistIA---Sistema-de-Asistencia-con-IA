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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class AsistenciaService {


    private final AsistenciaRepository asistenciaRepository;

    @Autowired
    private pythonClient pythonClient;

    private final  AsistenciaMapper asistenciaMapper;


    private final  TiposRegistroRepository tiposRegistroRepository;


    private final  UserServiceClient userServiceClient;

    public AsistenciaService(AsistenciaRepository asistenciaRepository, AsistenciaMapper asistenciaMapper, TiposRegistroRepository tiposRegistroRepository, UserServiceClient userServiceClient) {
        this.asistenciaRepository = asistenciaRepository;
        this.asistenciaMapper = asistenciaMapper;
        this.tiposRegistroRepository = tiposRegistroRepository;
        this.userServiceClient = userServiceClient;
    }


    public AsistenciaDtoResponse registrarAsistencia(Long idUsuario, AsistenciaDtoCreate dto) {

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
            // CASO: Intenta marcar demasiado temprano (ej. 5 AM para turno de 7 PM)
            throw new RuntimeException("Es demasiado temprano para marcar asistencia. Tu entrada es a las: " + horaEntrada);
            // O si prefieres guardarlo: estadoCalculado = "ANTICIPADO";
        } else if (horaActual.isAfter(horaLimiteTardanza)) {
            // CASO: Llegó después de la tolerancia
            estadoCalculado = "TARDE";
        } else {
            // CASO: Llegó en el rango correcto
            estadoCalculado = "PUNTUAL";
        }

        String tipoEventoAcabado = dto.tipoEvento() + " - " + estadoCalculado;

//VEMOS QUE TENGA UN REGISTRO CREVIAMENTE CREADO
        TiposRegistro registroID = tiposRegistroRepository.findById(dto.idTipoRegistro())
                .orElseThrow(() -> new RuntimeException("El Id no ha sido encontrado"));


        //MANDAMOS LOS DATOS QUE SON AUTOMATICOS.
        Asistencia asistencia = asistenciaMapper.toEntity(dto);
        asistencia.setIdUsuario(idUsuario);
        asistencia.setTiposRegistro(registroID);
        asistencia.setFecha(LocalDate.now());
        asistencia.setHoraRegistro(LocalTime.now());
        asistencia.setTipoEvento(tipoEventoAcabado);

        Asistencia asistenciaConDatos = asistenciaRepository.save(asistencia);

        return asistenciaMapper.toResponse(asistenciaConDatos);


    }


    public AsistenciaDtoResponse registrarPorReconocimiento(AsistenciaFacialDto dtoFacial) {

        IaRequestDto requestIa = new IaRequestDto(dtoFacial.rutaImagen());
        IaResponseDto respuestaIa = pythonClient.reconocerRostro(requestIa);

        if (respuestaIa.personas() == null || respuestaIa.personas().isEmpty()) {
            throw new RuntimeException("Rostro no reconocido o imagen inválida.");
        }

        String dniDetectado = respuestaIa.personas().getFirst();

        Long idUsuarioDescubierto;
        try {
            idUsuarioDescubierto = userServiceClient.obtenerIdPorDni(dniDetectado);
        } catch (FeignException.NotFound e) {
            throw new RuntimeException("La IA reconoció el DNI " + dniDetectado + ", pero no existe ese usuario en la base de datos.");
        }

        AsistenciaDtoCreate dtoAutomatico = new AsistenciaDtoCreate(
                dtoFacial.tipoEvento(), // <-- ¡Aquí está la mejora! Ya no es fijo.
                2L // ID para tipo "IA"
        );
        // ¡Llamamos a tu método maestro!
        return registrarAsistencia(idUsuarioDescubierto, dtoAutomatico);
    }
}
