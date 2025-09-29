package com.example.Auth_Service.service;

import com.example.Auth_Service.dto.LoginRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collection;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final JwtDecoder jwtDecoder;


    public AuthService(AuthenticationManager authenticationManager, TokenService tokenService, JwtDecoder jwtDecoder) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.jwtDecoder = jwtDecoder;
    }

    public Map<String, String> login(LoginRequest loginRequest) {
        //Creamos el "intento de login" y se lo pasamos al supervisor
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.correo(), loginRequest.contrasena())
        );

        return tokenService.generateTokens(authentication);
    }

    //Lógica para el flujo de refresco de token
    public Map<String, String> refreshAccessToken(String refreshTokenValue) {
        if (refreshTokenValue == null) {
            throw new IllegalArgumentException("El refresh token no puede ser nulo.");
        }
        try {

            Jwt decodedJwt = jwtDecoder.decode(refreshTokenValue);

            Authentication authentication = createAuthenticationFromJwt(decodedJwt);

            //Generamos solo un nuevo access token
            Map<String, String> newTokens = tokenService.generateTokens(authentication);

            return Map.of("accessToken", newTokens.get("accessToken"),"refreshToken",newTokens.get("refreshToken"));

        } catch (JwtException e) {
            throw new RuntimeException("Refresh token inválido o expirado", e);
        }
    }

    private Authentication createAuthenticationFromJwt(Jwt jwt) {
        //Extraer el sujeto (el correo del usuario)
        String subject = jwt.getSubject();

        //Extraer los permisos (scope) y convertirlos a una colección de GrantedAuthority
        String scope = jwt.getClaimAsString("scope");
        Collection<GrantedAuthority> authorities = Arrays.stream(scope.split(" "))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        //Crear el objeto Authentication ya validado usando el método estático 'authenticated'
        // Se usa 'null' para las credenciales porque el usuario ya fue autenticado previamente.
        return UsernamePasswordAuthenticationToken.authenticated(subject, null, authorities);
    }
}
