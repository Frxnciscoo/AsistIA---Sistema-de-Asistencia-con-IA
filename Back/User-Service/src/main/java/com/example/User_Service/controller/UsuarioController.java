package com.example.User_Service.controller;

import com.example.User_Service.dto.*;
import com.example.User_Service.entidad.Usuario;
import com.example.User_Service.service.UsuarioService;
// Agrega el correcto:
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

    // filepath: c:\PROYECTOS\Proyecto SOA\AsistIA---Sistema-de-Asistencia-con-IA\Back\User-Service\src\main\java\com\example\User_Service\controller\UsuarioController.java
// ...existing code...
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
                    .contentType(MediaType.IMAGE_JPEG)  // Cambia a IMAGE_PNG si es PNG
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }
    } catch (Exception e) {
        return ResponseEntity.internalServerError().build();
    }
}
    
    

// ...existing code...

    // El método getUserImage ha sido eliminado porque no coincide con la lógica de almacenamiento de imágenes.
    // Las imágenes se sirven directamente via ResourceHandler en AppCon.java (mapea /uploads/** a file:uploads/).
    // Accede a URLs como http://localhost:8081/uploads/usuarios/{filename} usando el campo 'imagen' de UserResponseDto.
    // Asegúrate de agregar WebSecurityCustomizer en SecurityConfig.java para ignorar /uploads/**.
}