package com.example.User_Service.dto;

import java.time.LocalDateTime;

public record RolResponseDto(Long idRol,
                             String codigoRol,
                             String nombreRol,
                             String descripcion,
                             Boolean estado,
                             LocalDateTime fechaCreacion) {
}
