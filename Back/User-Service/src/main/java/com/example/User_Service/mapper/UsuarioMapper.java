package com.example.User_Service.mapper;


import com.example.User_Service.dto.UserResponseDto;
import com.example.User_Service.dto.UserUpdateDto;
import com.example.User_Service.dto.UsuarioCreateDto;
import com.example.User_Service.entidad.Usuario;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "rol", ignore = true)
    Usuario toEntity(UsuarioCreateDto usuarioCreateDto);


    @Mapping(source = "rol.nombreRol" , target = "nombreRol")
    UserResponseDto toResponseDto(Usuario usuario);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(UserUpdateDto userUpdateDto, @MappingTarget Usuario entity);

}
