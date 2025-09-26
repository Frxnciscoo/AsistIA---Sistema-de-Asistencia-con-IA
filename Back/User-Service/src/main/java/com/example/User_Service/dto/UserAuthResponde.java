package com.example.User_Service.dto;

public record UserAuthResponde(Long idUsuario,
                               String correo,
                               String contrasenaHash,
                               String nombreRol,
                               Boolean estado
                               ) {
}
