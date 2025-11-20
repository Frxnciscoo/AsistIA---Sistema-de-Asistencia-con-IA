package com.example.Asistencia_Service.controller;

import com.example.Asistencia_Service.dto.AsistenciaDtoCreate;
import org.springframework.http.HttpHeaders;
import com.example.Asistencia_Service.dto.AsistenciaDtoResponse;
import com.example.Asistencia_Service.dto.AsistenciaFacialDto;
import com.example.Asistencia_Service.service.AsistenciaService;

import java.io.File;
import java.io.IOException;  // ← AGREGADO para transferTo
import java.util.UUID;  // ← AGREGADO para UUID.randomUUID()

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/asistencia")
@RestController
@CrossOrigin(origins = "http://localhost:4200")  // ← AGREGADO: Permite CORS desde el frontend
public class AsistenciaController {

    private static final Logger logger = LoggerFactory.getLogger(AsistenciaController.class);

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    // POR EL REQUESTHEADER MANDAMOS LA CABECERA
    // ESTE TIENE EL ID;
    // POR EL MOMENTO CON MINUSCULA, SE GENERA ERROR SI LO PASAMOS COMO LO TENEMOS EN EL GATEWAY
    @PostMapping
    public ResponseEntity<AsistenciaDtoResponse> asistenciacreada(@RequestHeader HttpHeaders headers, @RequestBody AsistenciaDtoCreate dto) {
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

    // ← MÉTODO AGREGADO: Reconocimiento facial público
    @PostMapping("/reconocimiento-facial")
public ResponseEntity<AsistenciaDtoResponse> registrarAsistenciaFacial(@RequestParam("image") MultipartFile image) {
    logger.info("🚨 Llegó al controlador reconocimiento-facial 🚨");

    if (image.isEmpty()) {
        logger.error("❌ Imagen vacía recibida");
        return ResponseEntity.badRequest().build();
    }

    try {
        // Usar directorio temporal del sistema y crear carpeta si no existe
        File tempDir = new File(System.getProperty("java.io.tmpdir"));
        if (!tempDir.exists()) {
            tempDir.mkdirs();
        }
        String rutaTemporal = tempDir.getAbsolutePath() + File.separator + UUID.randomUUID().toString() + ".jpg";
        File tempFile = new File(rutaTemporal);
        image.transferTo(tempFile);
        logger.info("📸 Imagen guardada en: {}", rutaTemporal);

        // Crear DTO con ruta y tipo evento fijo (ENTRADA)
        AsistenciaFacialDto dtoFacial = new AsistenciaFacialDto(rutaTemporal, "ENTRADA");

        // Llamar al servicio
        AsistenciaDtoResponse asistenciaCreada = asistenciaService.registrarPorReconocimiento(dtoFacial);

        return ResponseEntity.ok(asistenciaCreada);
    } catch (IOException e) {
        logger.error("❌ Error al guardar imagen: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    } catch (RuntimeException e) {
        logger.error("❌ Error en procesamiento: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}
}