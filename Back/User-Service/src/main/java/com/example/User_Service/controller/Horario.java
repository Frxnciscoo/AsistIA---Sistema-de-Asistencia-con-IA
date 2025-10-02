package com.example.User_Service.controller;


import com.example.User_Service.dto.*;
import com.example.User_Service.service.HorarioService;
import com.example.User_Service.service.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@PreAuthorize("hasAuthority('ADMIN')")
@RestController
@RequestMapping("/horarios")
public class Horario {

    @Autowired
    UsuarioService usuarioService;

    private static final Logger logger = LoggerFactory.getLogger(UsuarioController.class);

    private final HorarioService horarioService;

    public Horario(HorarioService horarioService) {
        this.horarioService = horarioService;
    }


    @GetMapping
    public ResponseEntity<List<HorarioRespondeDto>> listarRoles(){
        return ResponseEntity.ok(horarioService.listarHorario());
    }


    @PostMapping
    public ResponseEntity<HorarioRespondeDto> crearHorario(@RequestBody HorarioCreateDto horarioCreateDto){
        return ResponseEntity.ok(horarioService.crearHorario(horarioCreateDto));
    }


    @PutMapping("/{idHorario}")
    public ResponseEntity<HorarioRespondeDto> editarHorario( @PathVariable Long idHorario, @RequestBody HorarioUpdateDto horarioUpdateDto){
        return ResponseEntity.ok(horarioService.actualizarHorario(idHorario, horarioUpdateDto));
    }



    @DeleteMapping("/{idHorario}")
    public ResponseEntity<Void> eliminar (@PathVariable Long idHorario){
        horarioService.eliminarHorario(idHorario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{idUsuario}/asignar")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> asignarHorario(
            @PathVariable Long idUsuario,
            @RequestBody AsignacionHorario dto, // Usando el nombre de tu DTO
            @RequestHeader(name = "X-User-ID", required = false) Long adminId) {

        logger.info("Petición de asignación de horario recibida: Admin ID [{}] -> Usuario ID [{}], Horario ID [{}]",
                adminId, idUsuario, dto.idHorario());

        usuarioService.asignarHorario(idUsuario, dto);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }




    @GetMapping("/{idUsuario}/verHorario")
    @PreAuthorize("hasAuthority('ADMIN') or #idUsuario == authentication.principal.id")
    public ResponseEntity<List<AsignacionHorarioResponseDto>> listarHorariosDeUsuario(
            @PathVariable Long idUsuario) {

        // 1. Llama al servicio para obtener la lista de horarios asignados
        List<AsignacionHorarioResponseDto> horarios = usuarioService.listarHorariosPorUsuario(idUsuario);

        // 2. Devuelve la lista con un estado 200 OK
        return ResponseEntity.ok(horarios);
    }


}
