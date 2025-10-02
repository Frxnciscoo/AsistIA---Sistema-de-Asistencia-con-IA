package com.example.User_Service.controller;


import com.example.User_Service.dto.HorarioCreateDto;
import com.example.User_Service.dto.HorarioRespondeDto;
import com.example.User_Service.service.HorarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/horarios")
public class Horario {


    @Autowired
    private HorarioService horarioService;


    @GetMapping
    public ResponseEntity<List<HorarioRespondeDto>> listarRoles(){
        return ResponseEntity.ok(horarioService.listarHorario());
    }


    @PostMapping
    public ResponseEntity<HorarioRespondeDto> crearHorario(@RequestBody HorarioCreateDto horarioCreateDto){
        return ResponseEntity.ok(horarioService.crearHorario(horarioCreateDto));
    }

    @DeleteMapping("/{idHorario}")
    public ResponseEntity<Void> eliminar (@PathVariable Long idHorario){
        horarioService.eliminarHorario(idHorario);
        return ResponseEntity.noContent().build();
    }

}
