package com.example.Asistencia_Service.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import java.security.KeyFactory;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {


    // Este Bean crea el "lector de tarjetas" (JwtDecoder)
    @Bean
    public JwtDecoder jwtDecoder(RSAPublicKey publicKey) {
        return NimbusJwtDecoder.withPublicKey(publicKey).build();
    }

    // Este Bean lee el archivo de la clave pública
    @Bean
    public RSAPublicKey rsaPublicKey(@Value("${rsa.public-key}") String publicKeyPath) throws Exception {
        if (publicKeyPath.startsWith("classpath:")) {
            publicKeyPath = publicKeyPath.substring("classpath:".length());
        }
        var resource = new ClassPathResource(publicKeyPath);
        String key = new String(resource.getInputStream().readAllBytes());
        String publicKeyPEM = key.replace("-----BEGIN PUBLIC KEY-----", "").replaceAll(System.lineSeparator(), "").replace("-----END PUBLIC KEY-----", "");
        byte[] encoded = Base64.getDecoder().decode(publicKeyPEM);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        return (RSAPublicKey) keyFactory.generatePublic(new X509EncodedKeySpec(encoded));
    }

    // Este Bean establece las reglas de seguridad
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // Deshabilitamos CSRF para nuestra API stateless
                .csrf(AbstractHttpConfigurer::disable)

                // Definimos las reglas de autorización para las rutas
                .authorizeHttpRequests(auth -> {
                    // La ruta de health check para Consul debe ser pública
                    auth.requestMatchers("/actuator/health").permitAll();
                    // Cualquier otra petición requiere un token válido
                    auth.anyRequest().authenticated();
                })

                // La gestión de sesión debe ser stateless, no guardamos nada en el servidor
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // --- ¡ESTA ES LA LÍNEA MÁS IMPORTANTE! ---
                // Le decimos que actúe como un servidor de recursos y valide JWTs
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()))

                .build();
    }
}

