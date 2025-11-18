package com.example.User_Service.dto;

import com.example.User_Service.entidad.Rol;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioCreateDto(
        @NotBlank(message = "El nombre no puede ir vacio")
        String nombre,
        @NotBlank(message = "El apellido no puede ir vacio")
        String apellido,
        @NotBlank(message = "El campo de correo es obligatorio")
        String correo,
        @NotBlank(message = "El Dni de correo es obligatorio")
        String dni,
        @NotNull(message = "La contraseña es obligatoria")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        String contrasena,
        Long idRol){
}