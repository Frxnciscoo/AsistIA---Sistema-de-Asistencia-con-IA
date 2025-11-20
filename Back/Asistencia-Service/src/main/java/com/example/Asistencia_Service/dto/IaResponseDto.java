package com.example.Asistencia_Service.dto;

import java.util.List;

public record IaResponseDto(List<String> personas,
                            Integer rostros_detectados) {
}
