package com.example.Auth_Service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(String grantType,
        String correo,
        String contrasena,
        String refreshToken) {
}
