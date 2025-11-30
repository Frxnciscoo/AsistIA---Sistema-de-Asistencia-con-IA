package com.example.Asistencia_Service.dto;

public record IaEntrenarResponse(
        String codigo,
        String embeddings_guardados,
        String identificador,
        String mensaje,
        String status

) {
}
