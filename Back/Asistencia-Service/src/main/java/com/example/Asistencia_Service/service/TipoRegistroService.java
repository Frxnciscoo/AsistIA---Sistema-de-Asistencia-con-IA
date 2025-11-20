package com.example.Asistencia_Service.service;


import com.example.Asistencia_Service.dto.TipoRegistroDtoCreate;
import com.example.Asistencia_Service.dto.TipoRegistroDtoResponse;
import com.example.Asistencia_Service.entidad.TiposRegistro;
import com.example.Asistencia_Service.mapper.TipoRegistroMapper;
import com.example.Asistencia_Service.repository.TiposRegistroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TipoRegistroService {


    @Autowired
    private TipoRegistroMapper tipoRegistroMapper;

    @Autowired
    private TiposRegistroRepository tiposRegistroRepository;

    public List<TipoRegistroDtoResponse> listarRegistro(){
        return tiposRegistroRepository.findAll()
                .stream()
                .map(tipoRegistroMapper::respondeTipoDto)
                .toList();
    }

    public TipoRegistroDtoResponse crearRegistro(TipoRegistroDtoCreate tipoRegistroDtoCreate){
        TiposRegistro registro = tipoRegistroMapper.toEntity(tipoRegistroDtoCreate);
        TiposRegistro guardar = tiposRegistroRepository.save(registro);
        return tipoRegistroMapper.respondeTipoDto(guardar);
    }

    @Transactional
    public void eliminarRegistro(Long idTipoRegistro){
        TiposRegistro tipo = tiposRegistroRepository.findById(idTipoRegistro)
                .orElseThrow(() -> new RuntimeException("No se encuentra el  Id"));
        tipo.setEstado(false);
        tiposRegistroRepository.save(tipo);
    }
}