package com.example.User_Service.dto;

import com.example.User_Service.entidad.Rol;

public record UserUpdateDto(String nombre,
                            String apellido,
                            String dni,
                            Rol rol) {
}