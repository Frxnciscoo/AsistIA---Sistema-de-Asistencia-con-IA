package com.example.Asistencia_Service.config;


import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate requestTemplate) {
                // Obtenemos los atributos de la petición original que llegó al Asistencia-Service
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    // Extraemos la cabecera "Authorization" de la petición original
                    String authorizationHeader = attributes.getRequest().getHeader("Authorization");
                    if (authorizationHeader != null && !authorizationHeader.isEmpty()) {
                        // Añadimos esa misma cabecera a la nueva petición que OpenFeign va a realizar
                        requestTemplate.header("Authorization", authorizationHeader);
                    }
                }
            }
        };
    }
}
