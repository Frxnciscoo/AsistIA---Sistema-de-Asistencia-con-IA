package com.example.gateway_service.filters;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;


@Component
@Order(1) //que se ejecute de primera instancia
public class AuthenticationFilter implements GlobalFilter {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    private final JwtDecoder jwtDecoder;

    public AuthenticationFilter(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }


    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain ) {

        ServerHttpRequest serverHttpRequest = exchange.getRequest();
        String path = serverHttpRequest.getURI().getPath();


        //lista con rutas publicas
        List<String> rutasPublica = List.of("/Auth-Service/auth");
        Boolean isPublic = rutasPublica.stream()
                .anyMatch(path::startsWith);

        //checamos que sea la ruta publica
        if (isPublic) {
            logger.info("Ruta publica [{}] , se permite acceso sin token", path);
            return chain.filter(exchange);
        }

        //VEMOS AHORA LAS RUTAS PRIVADAS
        String authHeader = serverHttpRequest.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        //VEMOS POR EL ENCABEZADO SI TIENE EL TOKEN
        if (authHeader == null || !authHeader.startsWith("Bearer ")){
            logger.error("No se ha podido acceder a la ruta necesita un token", path);
            return onError(exchange,HttpStatus.UNAUTHORIZED);


        }

        //traemos el token
        String token = authHeader.substring(7);

        //validamos todos los datos que tiene el token
        try {
            Jwt decodedJwt = jwtDecoder.decode(token);

            //ARAVES DEL SUBJECT TRAEMOS AHORA EL ID.
            String userId = decodedJwt.getSubject(); // traemos el id

            //CREAMOS LA CABECERA AHORA CON NUESTRO ID
            ServerHttpRequest mutatedRequest = serverHttpRequest.mutate()
                    .header("X-User-ID", userId)
                    .build();

            logger.info("Gateway: Añadiendo cabecera X-User-ID con valor: {}", userId);

            ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();

            logger.info("\"Token válido. Usuario ID: {}. Petición reenviada a: {}", userId,path);
            return chain.filter(mutatedExchange); //dejamos pasar la ruta porque ya checamos el token


            // regresamos mensaje y no esta autorizado




        } catch (JwtException e){
            logger.error("el token es invalido", path, e.getMessage());
            return onError(exchange, HttpStatus.UNAUTHORIZED);

        }

    }


    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus httpStatus) {
        // 1. Obtenemos el objeto de la respuesta HTTP
        ServerHttpResponse response = exchange.getResponse();

        // 2. Establecemos el código de estado (ej. 401 Unauthorized)
        response.setStatusCode(httpStatus);

        // 3. Finalizamos la petición. No continuará hacia otros servicios.
        return response.setComplete();
    }
}
