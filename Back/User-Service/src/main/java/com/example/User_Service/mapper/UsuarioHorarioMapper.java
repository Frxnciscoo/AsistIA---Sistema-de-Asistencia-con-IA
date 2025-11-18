package com.example.User_Service.mapper;


import com.example.User_Service.dto.AsignacionHorario;
import com.example.User_Service.dto.AsignacionHorarioResponseDto;
import com.example.User_Service.entidad.UserHorario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UsuarioHorarioMapper {


    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "horario", ignore = true)
    UserHorario toEntity(AsignacionHorario dto);



    AsignacionHorarioResponseDto toResponseDto(UserHorario userHorario);




}