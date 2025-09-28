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

        UserAuthResponde usuario = restTemplate.getForObject(url,UserAuthResponde.class);

        if (usuario == null || !usuario.estado()) {
            throw new DisabledException("La cuenta para el usuario " + username + " está deshabilitada.");
        }
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(usuario.nombreRol()));
        return new org.springframework.security.core.userdetails.User(
                usuario.correo(),
                usuario.contrasenaHash(),
                authorities
        );
    }
}
