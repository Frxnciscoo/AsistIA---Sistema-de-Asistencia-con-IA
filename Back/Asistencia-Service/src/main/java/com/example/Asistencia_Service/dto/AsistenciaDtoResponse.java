package com.example.Asistencia_Service.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record AsistenciaDtoResponse(
        Long idAsistencia,
        Long idUsuario,
        LocalDate fecha,
        LocalTime horaRegistro,
        String tipoEvento,
        String nombreTipoRegistro,
        Boolean estado,
        String nombreUsuario,    // ← AGREGADO
        LocalDateTime fechaRegistro
) {}