package com.example.Auth_Service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TokenService {

    @Autowired
    private JwtEncoder jwtEncoder;

    public Map<String, String> generateTokens(Authentication authentication) {
        Instant now = Instant.now();


        //Dividimos el userDetails
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        //sacamos unicamente el userId.
        String userId = String.valueOf(userDetails.getId());


        //  Obtenemos los roles (scope) del usuario autenticado
        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));


        //CONSTRUIMOS NUESTRO TOKEN PERO AHORA CON EL ID
        JwtClaimsSet accessTokenClaims = JwtClaimsSet.builder()
                .issuer("auth-service")
                .issuedAt(now)
                .expiresAt(now.plus(15, ChronoUnit.MINUTES))
                .subject(userId)
                .claim("scope", scope)
                .build();


        JwtClaimsSet refreshTokenClaims = JwtClaimsSet.builder()
                .issuer("auth-service")
                .issuedAt(now)
                .expiresAt(now.plus(8, ChronoUnit.HOURS))
                .subject(userId)
                .claim("scope", scope)
                .build();

        //Codificamos ambos tokens usando el JwtEncoder
        String accessToken = jwtEncoder.encode(JwtEncoderParameters.from(accessTokenClaims)).getTokenValue();
        String refreshToken = jwtEncoder.encode(JwtEncoderParameters.from(refreshTokenClaims)).getTokenValue();

        // Devolvemos un mapa con ambos tokens
        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken
        );
    }


}
