package com.example.Asistencia_Service.service;


import com.example.Asistencia_Service.client.UserServiceClient;
import com.example.Asistencia_Service.dto.AsistenciaDtoCreate;
import com.example.Asistencia_Service.dto.AsistenciaDtoResponse;
import com.example.Asistencia_Service.dto.HorarioAsinadoDto;
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

        LocalTime horalimite = horarioAsignado.horaEntrada().plusMinutes(horarioAsignado.toleranciaMin());
        String estado = LocalTime.now().isAfter(horalimite) ? "TARDE" : "PUNTUAL";
        String tipoEventoAcabado = dto.tipoEvento() + " - " + estado;


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
}
