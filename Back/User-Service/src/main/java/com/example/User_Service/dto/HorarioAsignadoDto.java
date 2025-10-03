package com.example.User_Service.dto;

import java.time.LocalTime;

public record HorarioAsignadoDto(LocalTime horaEntrada,
                                 Integer toleranciaMin  ) {
}
