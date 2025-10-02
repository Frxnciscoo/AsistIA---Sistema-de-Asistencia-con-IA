package com.example.Asistencia_Service.service;


import com.example.Asistencia_Service.dto.AsistenciaDtoCreate;
import com.example.Asistencia_Service.dto.AsistenciaDtoResponse;
import com.example.Asistencia_Service.entidad.Asistencia;
import com.example.Asistencia_Service.entidad.TiposRegistro;
import com.example.Asistencia_Service.mapper.AsistenciaMapper;
import com.example.Asistencia_Service.repository.AsistenciaRepository;
import com.example.Asistencia_Service.repository.TiposRegistroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class AsistenciaService {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    @Autowired
    private AsistenciaMapper asistenciaMapper;

    @Autowired
    private TiposRegistroRepository tiposRegistroRepository;


    public AsistenciaDtoResponse registrarAsistencia(Long idUsuario, AsistenciaDtoCreate dto){


//VEMOS QUE TENGA UN REGISTRO CREVIAMENTE CREADO
        TiposRegistro registroID = tiposRegistroRepository.findById(dto.idTipoRegistro())
                .orElseThrow(()-> new RuntimeException("El Id no ha sido encontrado"));


        //MANDAMOS LOS DATOS QUE SON AUTOMATICOS.
        Asistencia asistencia = asistenciaMapper.toEntity(dto);
        asistencia.setIdUsuario(idUsuario);
        asistencia.setTiposRegistro(registroID);
        asistencia.setFecha(LocalDate.now());
        asistencia.setHoraRegistro(LocalTime.now());

        Asistencia asistenciaConDatos = asistenciaRepository.save(asistencia);

        return   asistenciaMapper.toResponse(asistenciaConDatos);


    }
}
