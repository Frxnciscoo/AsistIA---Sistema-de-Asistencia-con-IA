package com.example.Asistencia_Service.mapper;

import com.example.Asistencia_Service.dto.TipoRegistroDtoCreate;
import com.example.Asistencia_Service.dto.TipoRegistroDtoResponse;
import com.example.Asistencia_Service.entidad.TiposRegistro;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TipoRegistroMapper {


    @Mapping(target = "idTipoRegistro", ignore = true)
    @Mapping(target = "estado" , ignore = true)
    @Mapping(target = "fechaCreacion" , ignore = true)
    TiposRegistro toEntity(TipoRegistroDtoCreate DtoCreate);


    // no ignoramos nada ya que queremos traer todos los campos
    TipoRegistroDtoResponse respondeTipoDto(TiposRegistro entity);


}
