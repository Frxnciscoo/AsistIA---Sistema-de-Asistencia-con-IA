package com.example.Asistencia_Service.controller;


import com.example.Asistencia_Service.dto.AsistenciaDtoCreate;
import com.example.Asistencia_Service.dto.AsistenciaDtoResponse;
import com.example.Asistencia_Service.service.AsistenciaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/asistencia")
@RestController
public class AsistenciaController {


    @Autowired
    private AsistenciaService asistenciaService;


    //POR EL REQUESTHEADER MANDAMOS LA CABECERA
    //ESTE TIENE EL ID;
    //POR EL MOMENTO CON MINUSCULA, SE GENERA ERROR SI LO PASAMOS COMO LO TENEMOS EN EL GATEWAY
    @PostMapping
    public ResponseEntity<AsistenciaDtoResponse> asistenciacreada (@RequestHeader ("x-user-id") Long idUsuario, @RequestBody AsistenciaDtoCreate dto){
        AsistenciaDtoResponse asistenciaCreada = asistenciaService.
                registrarAsistencia(idUsuario, dto);
        return new ResponseEntity<>(asistenciaCreada, HttpStatus.CREATED);
    }
}
