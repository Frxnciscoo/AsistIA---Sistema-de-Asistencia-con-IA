package com.example.User_Service.dto;


//esto le enviamos a la auth para tenerlo dentro del jwt
public record UserAuthResponde(Long idUsuario,
                               String correo,
                               String contrasenaHash,
                               String nombreRol,
                               Boolean estado
                               ) {
}
