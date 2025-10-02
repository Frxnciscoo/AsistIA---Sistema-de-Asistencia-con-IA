package com.example.User_Service.service;

import com.example.User_Service.Exceptions.DuplicateHorario;
import com.example.User_Service.dto.HorarioCreateDto;
import com.example.User_Service.dto.HorarioRespondeDto;
import com.example.User_Service.dto.HorarioUpdateDto;
import com.example.User_Service.entidad.Horario;
import com.example.User_Service.mapper.HorarioMapper;
import com.example.User_Service.repository.HorarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HorarioService {

    @Autowired
    private HorarioRepository horarioRepository;


    @Autowired
    private HorarioMapper horarioMapper;


    public List<HorarioRespondeDto> listarHorario(){
        return horarioRepository.findAll()
                .stream()
                .map(horarioMapper::toResponseDto)
                .toList();
    }


    @Transactional
    public HorarioRespondeDto crearHorario(HorarioCreateDto horarioCreateDto){

        if (horarioRepository.existsBynombreHorario(horarioCreateDto.nombreHorario())){
            throw new DuplicateHorario("El nombre del horario ya se encuentra asignado");
        }

        Horario horario = horarioMapper.toEntity(horarioCreateDto);
        Horario guardado = horarioRepository.save(horario);
        return horarioMapper.toResponseDto(guardado);
    }



    public HorarioRespondeDto actualizarHorario(Long idHorario, HorarioUpdateDto horarioUpdateDto){
        Horario horario= horarioRepository.findById(idHorario)
                .orElseThrow(() -> new RuntimeException("No se encuentra este id"));

        horarioMapper.updateEntityFromDto(horarioUpdateDto, horario);

        Horario actualizado = horarioRepository.save(horario);

        return horarioMapper.toResponseDto(actualizado);
    }







    @Transactional
    public void eliminarHorario( Long idHorario){
        Horario horario = horarioRepository.findById(idHorario)
                .orElseThrow(() -> new RuntimeException("No se ha encontrado el id"));
        horario.setEstado(false);
        horarioRepository.save(horario);
    }

}
