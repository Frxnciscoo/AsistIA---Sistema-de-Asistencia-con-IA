package com.example.Asistencia_Service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        Map<String, Object> body = new HashMap<>();

        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value()); // Error 400
        body.put("error", "Error de Negocio");
        body.put("NO PUEDES MARCAR TU ASISTENCIA TAN TEMPRANO", ex.getMessage()); // <-- Aquí va tu mensaje: "Es demasiado temprano..."

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
