package com.example.User_Service.dto;

import jakarta.validation.constraints.NotBlank;

public record RolUpdateDto(

        Long idRol,
        @NotBlank(message = "El nombre no puede estar vacio")
        String nombreRol,
        @NotBlank(message = "La descripcion tiene un limite de 255 caracteres")
        String descripcion
) {
}
