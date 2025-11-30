package com.example.Asistencia_Service.controller;


import com.example.Asistencia_Service.dto.IaEntrenarRequest;
import com.example.Asistencia_Service.dto.IaEntrenarResponse;
import com.example.Asistencia_Service.service.AsistenciaService;
import com.example.Asistencia_Service.service.EntrenarService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/entrenar")
@RestController
public class EntrenarIaController {

    private final EntrenarService asistenciaService;

    public EntrenarIaController(EntrenarService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @PostMapping("/entrenar")
    public ResponseEntity<IaEntrenarResponse> entrenarIA(@RequestBody IaEntrenarRequest dto) {

        IaEntrenarResponse respuesta = asistenciaService.entrenarUsuario(dto.identificador());

        return new ResponseEntity<>(respuesta, HttpStatus.OK);
    }
}
