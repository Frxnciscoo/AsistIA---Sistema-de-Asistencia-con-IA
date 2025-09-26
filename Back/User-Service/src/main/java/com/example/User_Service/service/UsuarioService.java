package com.example.User_Service.service;


import com.example.User_Service.Exceptions.DuplicatedResourceException;
import com.example.User_Service.config.AppCon;
import com.example.User_Service.dto.UserResponseDto;
import com.example.User_Service.dto.UserUpdateDto;
import com.example.User_Service.dto.UsuarioCreateDto;
import com.example.User_Service.entidad.Credenciales;
import com.example.User_Service.entidad.Rol;
import com.example.User_Service.entidad.Usuario;
import com.example.User_Service.mapper.UsuarioMapper;
import com.example.User_Service.repository.CredencialesRepository;
import com.example.User_Service.repository.RolRepository;
import com.example.User_Service.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioMapper usuarioMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CredencialesRepository credencialesRepository;

    @Autowired
    private AppCon appCon;

    private final PasswordEncoder passwordEncoder;

    @Autowired
    private RolRepository rolRepository;

    public UsuarioService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }


    @Transactional
    public UserResponseDto crearUsuario(UsuarioCreateDto usuarioCreateDto ){
        if (usuarioRepository.existsByCorreo(usuarioCreateDto.correo())){
            throw new DuplicatedResourceException("El correo " + usuarioCreateDto.correo() + "se encuentra en uso");
        }
        if (usuarioRepository.existsByDni(usuarioCreateDto.dni())){
            throw new DuplicatedResourceException("El dni" + usuarioCreateDto.dni() + "le pertenece a otra persona");
        }

        Rol rol = rolRepository.findById(usuarioCreateDto.idRol())
                .orElseThrow(() -> new ResourceNotFoundException("El rolque buscas no existe"));


        Usuario usuario = usuarioMapper.toEntity(usuarioCreateDto);
        usuario.setRol(rol);
        Usuario guardar = usuarioRepository.save(usuario);


        String contrasenaEncriptada = passwordEncoder.encode(usuarioCreateDto.contrasena());

        Credenciales nuevaCredencial = new Credenciales(guardar,contrasenaEncriptada);


        credencialesRepository.save(nuevaCredencial);

        return usuarioMapper.toResponseDto(guardar);


    }

    public List<UserResponseDto> listarUsuarioso(){
        return usuarioRepository.findAll()
                .stream()
                .map(usuarioMapper::toResponseDto)
                .toList();
    }


    public UserResponseDto actualizarCliente(@PathVariable Long idUsuario,  UserUpdateDto userUpdateDto){
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("No se ha encontrado el usuario"));

        usuarioMapper.updateEntityFromDto(userUpdateDto, usuario);

        Usuario actualizado = usuarioRepository.save(usuario);

        return usuarioMapper.toResponseDto(actualizado);
    }


    public void eliminarUsuario(@PathVariable Long idUsuario){
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("No se ha encontrado el usuario"));

        usuario.setEstado(false);

        usuarioRepository.save(usuario);
    }



}
