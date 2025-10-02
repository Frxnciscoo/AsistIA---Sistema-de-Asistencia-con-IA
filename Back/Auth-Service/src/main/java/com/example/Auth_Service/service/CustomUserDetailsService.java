package com.example.Auth_Service.service;

import com.example.Auth_Service.dto.UserAuthResponde;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final RestTemplate restTemplate;

    public CustomUserDetailsService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String url = "http://User-service/Usuarios/internal/auth?correo=" + username;
        // se recomienda cambiar la url por las MAYUS - MINUS , pero por el momento me sirve.

        UserAuthResponde usuario = restTemplate.getForObject(url,UserAuthResponde.class);

        if (usuario == null || !usuario.estado()) {
            throw new DisabledException("La cuenta para el usuario " + username + " está deshabilitada.");
        }

        //creamos nuestro carnet de identidad en esta ocación con el ID, ya que lo necesitamos
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(usuario.nombreRol()));
        return new CustomUserDetails(
                usuario.idUsuario(),
                usuario.correo(),
                usuario.contrasenaHash(),
                usuario.estado(),
                authorities

        );
    }
}
