package com.example.User_Service.dto;

import jakarta.validation.constraints.NotBlank;

public record RolCreateDto(
        @NotBlank(message = "Se debe incluir el codigo del Rol")
        String codigoRol,
                        @NotBlank(message = "El rol debe incluir un nombre")
                        String nombreRol,
                        @NotBlank(message = "Se debe insertar una descripción")
                        String descripcion) {
}
