package com.example.Asistencia_Service.controller;


import com.example.Asistencia_Service.dto.AsistenciaDtoCreate;
import com.example.Asistencia_Service.dto.AsistenciaFacialDto;
import org.springframework.http.HttpHeaders;
import com.example.Asistencia_Service.dto.AsistenciaDtoResponse;
import com.example.Asistencia_Service.service.AsistenciaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/asistencia")
@RestController
public class AsistenciaController {

    private static final Logger logger = LoggerFactory.getLogger(AsistenciaController.class);


    private final AsistenciaService asistenciaService;


    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    //POR EL REQUESTHEADER MANDAMOS LA CABECERA
    //ESTE TIENE EL ID;
    //POR EL MOMENTO CON MINUSCULA, SE GENERA ERROR SI LO PASAMOS COMO LO TENEMOS EN EL GATEWAY
    @PostMapping
    public ResponseEntity<AsistenciaDtoResponse> asistenciacreada (@RequestHeader HttpHeaders headers, @RequestBody AsistenciaDtoCreate dto){
        System.out.println("🚨 Llegó al controlador asistenciacreada 🚨");


        headers.forEach((key, value) -> {
            logger.info("👉 Header recibido: {} = {}", key, value);
        });

        String userId = headers.getFirst("X-User-ID");
        logger.info("📌 Header buscado manualmente X-User-ID = {}", userId);

         Long idUsuario = (userId != null) ? Long.valueOf(userId) : null;



        // La llamada al servicio DEBERÍA usar la variable 'idUsuario' que acabamos de crear
        AsistenciaDtoResponse asistenciaCreada = asistenciaService.registrarAsistencia(idUsuario, dto);

        return new ResponseEntity<>(asistenciaCreada, HttpStatus.CREATED);
    }

    @PostMapping("/reconocimiento-facial") // Una ruta descriptiva
    public ResponseEntity<AsistenciaDtoResponse> registrarPorFacial(
            @RequestBody AsistenciaFacialDto dto) {

        if (dto.rutaImagen() == null || dto.rutaImagen().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        AsistenciaDtoResponse respuesta = asistenciaService.registrarPorReconocimiento(dto);

        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

}


