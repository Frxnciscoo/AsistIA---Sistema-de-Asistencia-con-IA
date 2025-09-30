package com.example.gateway_service.Config;

import org.springframework.cloud.client.discovery.ReactiveDiscoveryClient;
import org.springframework.cloud.gateway.discovery.DiscoveryClientRouteDefinitionLocator;
import org.springframework.cloud.gateway.discovery.DiscoveryLocatorProperties;
import org.springframework.context.annotation.Bean;

public class GatewayConfig {



    //DiscoveryLocator descubre los microservicios automaticamente del discovery client
//ReactiveDiscoverery, pregunta por los microservicios disponibles
//DiscoveryClientRouteDefinitionLocator crea las rutas automaticamente por un servicio de microservicio
    @Bean
    DiscoveryClientRouteDefinitionLocator dinamicRoute(ReactiveDiscoveryClient rdc, DiscoveryLocatorProperties dlp){
        return new DiscoveryClientRouteDefinitionLocator(rdc, dlp);

    }
}
