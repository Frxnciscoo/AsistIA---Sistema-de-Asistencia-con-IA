package com.example.Asistencia_Service.controller;

import com.example.Asistencia_Service.dto.AsistenciaDtoCreate;
import org.springframework.http.HttpHeaders;
import com.example.Asistencia_Service.dto.AsistenciaDtoResponse;
import com.example.Asistencia_Service.dto.AsistenciaFacialDto;
import com.example.Asistencia_Service.service.AsistenciaService;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RequestMapping("/asistencia")
@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class AsistenciaController {

    private static final Logger logger = LoggerFactory.getLogger(AsistenciaController.class);

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @PostMapping
    public ResponseEntity<AsistenciaDtoResponse> asistenciacreada(@RequestHeader HttpHeaders headers, @RequestBody AsistenciaDtoCreate dto) {
        System.out.println("🚨 Llegó al controlador asistenciacreada 🚨");

        headers.forEach((key, value) -> {
            logger.info("👉 Header recibido: {} = {}", key, value);
        });

        String userId = headers.getFirst("X-User-ID");
        logger.info("📌 Header buscado manualmente X-User-ID = {}", userId);

        Long idUsuario = (userId != null) ? Long.valueOf(userId) : null;

        AsistenciaDtoResponse asistenciaCreada = asistenciaService.registrarAsistencia(idUsuario, dto);

        return new ResponseEntity<>(asistenciaCreada, HttpStatus.CREATED);
    }

    @PostMapping("/reconocimiento-facial")
    public ResponseEntity<?> registrarAsistenciaFacial(@RequestParam("image") MultipartFile image) {
        logger.info("🚨 Llegó al controlador reconocimiento-facial 🚨");

        if (image.isEmpty()) {
            logger.error("❌ Imagen vacía recibida");
            return ResponseEntity.badRequest()
                    .body(crearErrorResponse("La imagen está vacía"));
        }

        try {
            // Guardar en C:\dockerprojects\imagenes\
            String uploadDir = "C:\\dockerprojects\\imagenes";
            File uploadDirFile = new File(uploadDir);
            
            if (!uploadDirFile.exists()) {
                uploadDirFile.mkdirs();
                logger.info("📁 Carpeta creada: {}", uploadDir);
            }
            
            // Generar nombre único para la imagen
            String fileName = UUID.randomUUID() + ".jpg";
            File sharedFile = new File(uploadDir, fileName);
            
            // Guardar la imagen
            image.transferTo(sharedFile);
            logger.info("📸 Imagen guardada en: {}", sharedFile.getAbsolutePath());
            
            // Enviar ruta a la IA
            String rutaParaIa = "/imagenes/" + fileName;
            logger.info("🔗 Ruta enviada a la IA: {}", rutaParaIa);
            
            AsistenciaFacialDto dtoFacial = new AsistenciaFacialDto(rutaParaIa, "ENTRADA");
            
            try {
                AsistenciaDtoResponse response = asistenciaService.registrarPorReconocimiento(dtoFacial);
                logger.info("✅ Asistencia registrada correctamente para DNI reconocido");
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
                
            } catch (RuntimeException e) {
                logger.error("❌ Error de negocio: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(crearErrorResponse(e.getMessage()));
            }
            
        } catch (IOException e) {
            logger.error("❌ Error al guardar imagen: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(crearErrorResponse("Error al guardar la imagen: " + e.getMessage()));
                    
        } catch (Exception e) {
            logger.error("❌ Error inesperado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(crearErrorResponse("Error inesperado: " + e.getMessage()));
        }
    }

    // ← MÉTODO AUXILIAR: Crear respuesta de error estándar
    private Map<String, Object> crearErrorResponse(String mensaje) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", mensaje);
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
    // ← ELIMINADO: El método obtenerUsuarioPorId que causaba error
}