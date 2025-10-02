package com.example.User_Service.dto;

import java.time.LocalTime;

public record HorarioCreateDto(String nombreHorario,
                               LocalTime horaEntrada,
                               LocalTime horaSalida,
                               Integer toleranciaMin) {
}
