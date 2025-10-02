package com.example.User_Service.dto;

import com.example.User_Service.controller.Horario;

import java.time.LocalDate;

public record AsignacionHorarioResponseDto(
        Long idUsuarioHorario,
        LocalDate fechaInicio,
                                           LocalDate fechaFin,
                                           HorarioRespondeDto horario) {
}
