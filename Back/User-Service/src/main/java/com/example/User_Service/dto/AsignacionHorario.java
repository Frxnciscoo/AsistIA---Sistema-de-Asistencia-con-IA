package com.example.User_Service.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record AsignacionHorario(Long idHorario,
                                LocalDate fechaInicio,
                                LocalDate fechaFin) {
}
