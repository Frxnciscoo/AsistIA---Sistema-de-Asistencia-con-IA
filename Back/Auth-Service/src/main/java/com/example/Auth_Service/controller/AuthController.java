package com.example.Auth_Service.controller;


import com.example.Auth_Service.dto.LoginRequest;
import com.example.Auth_Service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RequestMapping("/auth")
@RestController
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/token")
    public ResponseEntity<Map<String, String>> token(@RequestBody LoginRequest loginRequest) {
        if ("password".equals(loginRequest.grantType())) {
            Map<String, String> tokens = authService.login(loginRequest);
            return ResponseEntity.ok(tokens);
        } else if ("refresh_token".equals(loginRequest.grantType())) {
            Map<String, String> tokens = authService.refreshAccessToken(loginRequest.refreshToken());
            return ResponseEntity.ok(tokens);
        } else {
            return new ResponseEntity<>(Map.of("error", "Unsupported grant type"), HttpStatus.BAD_REQUEST);
        }
    }
}
