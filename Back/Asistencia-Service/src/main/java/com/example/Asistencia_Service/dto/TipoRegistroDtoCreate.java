package com.example.Asistencia_Service.dto;

import jakarta.validation.constraints.NotBlank;

public record TipoRegistroDtoCreate(
        @NotBlank(message = "Este campo no puede ser vacio")
        String nombreTipo) {
}
