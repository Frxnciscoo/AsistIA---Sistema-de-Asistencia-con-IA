package com.example.User_Service.controller;

import com.example.User_Service.dto.RolCreateDto;
import com.example.User_Service.dto.RolResponseDto;
import com.example.User_Service.dto.RolUpdateDto;
import com.example.User_Service.service.RolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RequestMapping("/rol")
@RestController
@RefreshScope
public class RolController {

    @Autowired
    RolService rolService;

    @Value("${global.params.p1}")
    private String p1;

    @Value("${global.params.p2}")
    private String p2;

    @Value("${user.params.x}")
    private String x;

    @Value("${user.params.y}")
    private String y;



    @GetMapping
    public ResponseEntity<List<RolResponseDto>> listarRoles(){
        return ResponseEntity.ok(rolService.listarRoles());
    }

    @PostMapping
    public ResponseEntity<RolResponseDto> crearRol(@RequestBody RolCreateDto rolCreateDto){
        return ResponseEntity.ok(rolService.crearRol(rolCreateDto));
    }

    @PutMapping("/{idRol}")
    public ResponseEntity<RolResponseDto> editarRol(@PathVariable Long idRol, @RequestBody RolUpdateDto rolUpdateDto){
        return ResponseEntity.ok(rolService.actualizarRol(idRol,rolUpdateDto));
    }

    @DeleteMapping("/{idRol}")
    public ResponseEntity<Void> eliminarRol(@PathVariable Long idRol){

        rolService.eliminarRol(idRol);
        return ResponseEntity.noContent().build();

    }


}
