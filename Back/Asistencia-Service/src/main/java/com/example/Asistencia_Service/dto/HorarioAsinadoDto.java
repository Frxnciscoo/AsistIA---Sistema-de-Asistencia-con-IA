package com.example.Asistencia_Service.dto;

import java.time.LocalTime;

public record HorarioAsinadoDto(LocalTime horaEntrada,
                                Integer toleranciaMin  ) {
}
