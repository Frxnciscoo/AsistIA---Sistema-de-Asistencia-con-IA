package com.example.User_Service.controller;


import com.example.User_Service.dto.HorarioCreateDto;
import com.example.User_Service.dto.HorarioRespondeDto;
import com.example.User_Service.dto.HorarioUpdateDto;
import com.example.User_Service.service.HorarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/horarios")
public class Horario {



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

}
