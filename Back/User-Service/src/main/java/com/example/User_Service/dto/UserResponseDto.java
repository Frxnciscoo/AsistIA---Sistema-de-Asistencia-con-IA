package com.example.User_Service.dto;

import com.example.User_Service.entidad.Rol;

import java.sql.Timestamp;
import java.time.LocalDateTime;

public record UserResponseDto(Long idUsuario,
                              String nombre,
                              String correo,
                              String dni,
                              Boolean estado,
                              LocalDateTime fechaCreacion,
                              String nombreRol,
                              String imagen) {
}