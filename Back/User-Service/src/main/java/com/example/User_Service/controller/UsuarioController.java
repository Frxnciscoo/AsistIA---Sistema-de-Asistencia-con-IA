package com.example.User_Service.controller;


import com.example.User_Service.dto.UserResponseDto;
import com.example.User_Service.dto.UsuarioCreateDto;
import com.example.User_Service.entidad.Usuario;
import com.example.User_Service.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
