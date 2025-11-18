package com.example.User_Service.mapper;

import com.example.User_Service.dto.RolCreateDto;
import com.example.User_Service.dto.RolResponseDto;
import com.example.User_Service.dto.RolUpdateDto;
import com.example.User_Service.entidad.Rol;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RolMapper {


    //Se generan automaticamente o ya se instanciaron en la base de datos
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    Rol toEntity(RolCreateDto Viewdto);

    //Sin problema queremos mostrar todos los campos
    RolResponseDto toResponseDto(Rol entity);


    //Lea el Dto RolUpdate para ver que campos son editables
    void updateEntityFromDto (RolUpdateDto rolUpdateDto, @MappingTarget Rol entity);









}