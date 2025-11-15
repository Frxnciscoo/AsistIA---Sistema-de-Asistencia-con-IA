package com.example.User_Service.mapper;

import com.example.User_Service.dto.HorarioCreateDto;
import com.example.User_Service.dto.HorarioRespondeDto;
import com.example.User_Service.dto.HorarioUpdateDto;
import com.example.User_Service.dto.RolResponseDto;
import com.example.User_Service.entidad.Horario;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface HorarioMapper {


    @Mapping(target = "estado" , ignore = true)
    @Mapping(target = "fechaCreacion" , ignore = true)
    Horario toEntity (HorarioCreateDto horarioCreateDto);


    // de igual manera mostramos todos los campos
    HorarioRespondeDto toResponseDto(Horario entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto (HorarioUpdateDto horarioUpdateDto, @MappingTarget Horario entity);
}
