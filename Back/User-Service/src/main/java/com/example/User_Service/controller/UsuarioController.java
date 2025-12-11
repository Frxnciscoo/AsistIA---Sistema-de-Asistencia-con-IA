package com.example.User_Service.controller;

import com.example.User_Service.dto.*;
import com.example.User_Service.entidad.Usuario;
import com.example.User_Service.service.UsuarioService;
import org.springframework.core.io.Resource;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/Usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<UserResponseDto> crearUsuario(@Valid @RequestBody UsuarioCreateDto usuarioCreateDto) {
        UserResponseDto crearUsuario = usuarioService.crearUsuario(usuarioCreateDto);
        return new ResponseEntity<>(crearUsuario, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuarioso());
    }

    @PutMapping("/{idUsuario}")
    public ResponseEntity<UserResponseDto> editarUsuario(@PathVariable Long idUsuario, @RequestBody UserUpdateDto userUpdateDto) {
        return ResponseEntity.ok(usuarioService.actualizarCliente(idUsuario, userUpdateDto));
    }

    @DeleteMapping("/{idUsuario}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long idUsuario) {
        usuarioService.eliminarUsuario(idUsuario);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/internal/auth")
    public ResponseEntity<UserAuthResponde> buscarAuth(@RequestParam String correo) {
        UserAuthResponde user = usuarioService.endPoint(correo);
        return ResponseEntity.ok(user);
    }

    // ← ENDPOINT AGREGADO: Buscar usuario por DNI (para Asistencia-Service)
    @GetMapping("/internal/buscar-por-dni/{dni}")
    public ResponseEntity<Long> obtenerIdPorDni(@PathVariable String dni) {
        Long idUsuario = usuarioService.obtenerIdPorDni(dni);
        return ResponseEntity.ok(idUsuario);
    }

    @GetMapping("/{idUsuario}/horario-actual")
    public ResponseEntity<HorarioAsignadoDto> obtenerHorarioDelUsuario(@PathVariable Long idUsuario) {
        HorarioAsignadoDto horarioDto = usuarioService.obtenerHorarioActualPorHorario(idUsuario);
        return ResponseEntity.ok(horarioDto);
    }

    @PostMapping("/{idUsuario}/imagen")
    public ResponseEntity<UserResponseDto> subirImagenUsuario(
            @PathVariable Long idUsuario,
            @RequestParam("imagen") MultipartFile imagen) {
        UserResponseDto response = usuarioService.subirImagenUsuario(idUsuario, imagen);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{idUsuario}/imagen")
    public ResponseEntity<Resource> obtenerImagenUsuario(@PathVariable Long idUsuario) {
        Usuario usuario = usuarioService.buscarUsuarioPorId(idUsuario);
        if (usuario.getImagen() == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            Path path = Paths.get("uploads/usuarios/" + Paths.get(usuario.getImagen()).getFileName());
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    @GetMapping("/{idUsuario}")
    public ResponseEntity<UserResponseDto> obtenerUsuarioPorId(@PathVariable Long idUsuario) {
        UserResponseDto usuarioDto = usuarioService.obtenerUsuarioPorId(idUsuario);
        return ResponseEntity.ok(usuarioDto);
    }
}