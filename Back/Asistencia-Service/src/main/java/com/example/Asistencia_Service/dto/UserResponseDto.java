package com.example.Asistencia_Service.dto;

import java.time.LocalDateTime;

public record UserResponseDto(
        Long idUsuario,
        String nombre,
        String correo,
        String dni,
        Boolean estado,
        LocalDateTime fechaCreacion,
        String nombreRol,
        String imagen
) {}