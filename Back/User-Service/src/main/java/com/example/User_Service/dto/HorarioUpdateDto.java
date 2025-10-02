package com.example.User_Service.dto;

import java.time.LocalTime;

public record HorarioUpdateDto(String nombreHorario,
                               LocalTime horaEntrada,
                               LocalTime horaSalida,
                               Integer toleranciaMin,
                               Boolean estado) {
}
