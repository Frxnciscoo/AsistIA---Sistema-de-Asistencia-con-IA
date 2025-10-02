package com.example.User_Service.dto;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record HorarioRespondeDto(Long idHorario,
                                 String nombreHorario,
                                 LocalTime horaEntrada,
                                 LocalTime horaSalida,
                                 Integer toleranciaMin,
                                 Boolean estado,
                                 LocalDateTime fechaCreacion) {
}
