package com.example.User_Service.service;

import com.example.User_Service.dto.RolCreateDto;
import com.example.User_Service.dto.RolResponseDto;
import com.example.User_Service.dto.RolUpdateDto;
import com.example.User_Service.entidad.Rol;
import com.example.User_Service.mapper.RolMapper;
import com.example.User_Service.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RolService {

    @Autowired
    RolRepository rolRepository;

    @Autowired
    RolMapper rolMapper;

    public List<RolResponseDto> listarRoles() {
        return rolRepository.findAll()
                .stream()
                .map(rolMapper::toResponseDto)
                .toList();
    }

    @Transactional
    public RolResponseDto crearRol(RolCreateDto createDto){
        Rol rol =rolMapper.toEntity(createDto);
        Rol guardado = rolRepository.save(rol);return rolMapper.toResponseDto(guardado);
    }

    public RolResponseDto actualizarRol (Long rolId, RolUpdateDto rolUpdateDto){
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("No se ha encontrado el Id"));

        rolMapper.updateEntityFromDto(rolUpdateDto, rol);

        Rol  actualizado = rolRepository.save(rol);

        return rolMapper.toResponseDto(actualizado);
    }

    @Transactional
    public void eliminarRol(Long rolId) {
        Rol rol = rolRepository.findById(rolId)
                .orElseThrow(() -> new RuntimeException("No se ha encontrado el Id"));
        // Soft delete → desactivar, ya no lo hacemos desde la entidad
        rol.setEstado(false);
        rolRepository.save(rol);
    }



}
