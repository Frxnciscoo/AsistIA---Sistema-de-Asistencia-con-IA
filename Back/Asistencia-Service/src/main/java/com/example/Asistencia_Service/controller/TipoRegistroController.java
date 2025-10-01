package com.example.Asistencia_Service.controller;


import com.example.Asistencia_Service.dto.TipoRegistroDtoCreate;
import com.example.Asistencia_Service.dto.TipoRegistroDtoResponse;
import com.example.Asistencia_Service.service.TipoRegistroService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registros")
public class TipoRegistroController {


    @Autowired
    TipoRegistroService tipoRegistroService;

    @GetMapping
    public ResponseEntity<List<TipoRegistroDtoResponse>> listarRegistros(){
        return ResponseEntity.ok(tipoRegistroService.listarRegistro());
    }

    @PostMapping
    public ResponseEntity<TipoRegistroDtoResponse> crearRegistro(@RequestBody TipoRegistroDtoCreate create){
        return ResponseEntity.ok(tipoRegistroService.crearRegistro(create));
    }

    @DeleteMapping("{idTipoRegistro}")
    public ResponseEntity<Void> eliminar (@PathVariable Long idTipoRegistro){
        tipoRegistroService.eliminarRegistro(idTipoRegistro);
        return ResponseEntity.noContent().build();
    }

}
