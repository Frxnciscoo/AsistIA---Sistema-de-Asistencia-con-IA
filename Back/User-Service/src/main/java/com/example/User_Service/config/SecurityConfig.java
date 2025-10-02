package com.example.User_Service.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;


import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception{
        return httpSecurity
                //le damos permiso a todas las rutas con auth

                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/actuator/health").permitAll();
                    auth.requestMatchers("/Usuarios/internal/**").permitAll();
                    auth.anyRequest().authenticated();
                })

                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                //bloquea al apigateway
                //.oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()))
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()))

                .build();
    }

    @Bean
    public RSAPublicKey rsaPublicKey(@Value("${rsa.public-key}") String publicKeyPath) throws Exception {
        // Limpiamos la ruta del prefijo "classpath:" para que ClassPathResource funcione
        if (publicKeyPath.startsWith("classpath:")) {
            publicKeyPath = publicKeyPath.substring("classpath:".length());
        }

        var resource = new ClassPathResource(publicKeyPath);
        String key = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        String publicKeyPEM = key
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replaceAll(System.lineSeparator(), "")
                .replace("-----END PUBLIC KEY-----", "");

        byte[] encoded = Base64.getDecoder().decode(publicKeyPEM);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");

        return (RSAPublicKey) keyFactory.generatePublic(new X509EncodedKeySpec(encoded));
    }


    @Bean
    public JwtDecoder jwtDecoder(RSAPublicKey publicKey) {
        return NimbusJwtDecoder.withPublicKey(publicKey).build();
    }
}
