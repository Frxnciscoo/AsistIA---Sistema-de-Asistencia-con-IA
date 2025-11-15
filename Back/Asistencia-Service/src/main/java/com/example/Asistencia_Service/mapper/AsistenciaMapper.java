package com.example.Asistencia_Service.mapper;


import com.example.Asistencia_Service.dto.AsistenciaDtoCreate;
import com.example.Asistencia_Service.dto.AsistenciaDtoResponse;
import com.example.Asistencia_Service.entidad.Asistencia;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AsistenciaMapper {


    @Mapping(target = "idAsistencia" , ignore = true)
    @Mapping(target = "idUsuario" , ignore = true)
    @Mapping(target = "fecha", ignore = true)
    @Mapping(target = "horaRegistro", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaRegistro", ignore = true)
    @Mapping(target = "tiposRegistro", ignore = true)
    Asistencia toEntity(AsistenciaDtoCreate asistenciaDtoCreate);


    @Mapping(source = "tiposRegistro.nombreTipo" , target = "nombreTipoRegistro")
    AsistenciaDtoResponse toResponse(Asistencia asistencia);
}
