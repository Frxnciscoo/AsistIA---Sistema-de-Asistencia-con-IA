package com.example.User_Service.mapper;


import com.example.User_Service.dto.UserAuthResponde;
import com.example.User_Service.dto.UserResponseDto;
import com.example.User_Service.dto.UserUpdateDto;
import com.example.User_Service.dto.UsuarioCreateDto;
import com.example.User_Service.entidad.Credenciales;
import com.example.User_Service.entidad.Usuario;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    @Mapping(target = "rol", ignore = true)
    Usuario toEntity(UsuarioCreateDto usuarioCreateDto);

    @Mapping(source = "idUsuario", target = "idUsuario") 
    @Mapping(source = "rol.nombreRol" , target = "nombreRol")
    @Mapping(source = "imagen", target = "imagen")
    UserResponseDto toResponseDto(Usuario usuario);

    @Mapping(source = "usuario.idUsuario", target = "idUsuario")
    @Mapping(source = "usuario.correo", target = "correo")
    @Mapping(source = "usuario.estado", target = "estado")
    @Mapping(source = "usuario.rol.nombreRol", target = "nombreRol")
    @Mapping(source = "contrasenaHash", target = "contrasenaHash")
    UserAuthResponde toAuthResponseDto(Credenciales credencial);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
void updateEntityFromDto(UserUpdateDto userUpdateDto, @MappingTarget Usuario entity);

}