package com.example.Asistencia_Service.dto;

import java.time.LocalDateTime;

public record TipoRegistroDtoResponse(Long idTipoRegistro,
                                      String nombreTipo,
                                      Boolean estado,
                                      LocalDateTime fechaCreacion) {
}
