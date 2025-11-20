package com.example.User_Service.controller;


import com.example.User_Service.dto.*;
import com.example.User_Service.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Usuarios")
public class UsuarioController {


    @Autowired
    private UsuarioService usuarioService;


    @PostMapping
    public ResponseEntity<UserResponseDto> crearUsuario(@Valid  @RequestBody UsuarioCreateDto usuarioCreateDto){

        UserResponseDto crearUsuario = usuarioService.crearUsuario(usuarioCreateDto);
        return new ResponseEntity<>(crearUsuario,HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDto>> listarUsuarios(){
        return ResponseEntity.ok(usuarioService.listarUsuarioso());
    }

    @PutMapping("/{idUsuario}")
    public ResponseEntity<UserResponseDto> editarUsuario(@PathVariable Long idUsuario, @RequestBody UserUpdateDto userUpdateDto){
        return ResponseEntity.ok(usuarioService.actualizarCliente(idUsuario,userUpdateDto));
    }

    @DeleteMapping("/{idUsuario}")
    public ResponseEntity<Void> eliminarUsuario (@PathVariable Long idUsuario){
        usuarioService.eliminarUsuario(idUsuario);
        return ResponseEntity.noContent().build();
    }

   @GetMapping("/internal/auth")
   public ResponseEntity<UserAuthResponde> buscarAuth(@RequestParam String correo){
       UserAuthResponde user = usuarioService.endPoint(correo);
     return ResponseEntity.ok(user);
    }


    @GetMapping("/{idUsuario}/horario-actual")
    public ResponseEntity<HorarioAsignadoDto> obtenerHorarioDelUsuario(@PathVariable Long idUsuario){
        HorarioAsignadoDto horarioDto = usuarioService.obtenerHorarioActualPorHorario(idUsuario);
        return ResponseEntity.ok(horarioDto);
    }

    @GetMapping("/internal/buscar-por-dni/{dni}")
    public ResponseEntity<Long> buscarPorDni(@PathVariable String dni) {
        Long idUsuario = usuarioService.obtenerIdPorDni(dni);
        if (idUsuario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(idUsuario);
    }

}
