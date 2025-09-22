package com.example.gateway_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.ReactiveDiscoveryClient;
import org.springframework.cloud.gateway.discovery.DiscoveryClientRouteDefinitionLocator;
import org.springframework.cloud.gateway.discovery.DiscoveryLocatorProperties;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GatewayServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(GatewayServiceApplication.class, args);
	}




	//DiscoveryLocator descubre los microservicios automaticamente del discovery client
	//ReactiveDiscoverery, pregunta por los microservicios disponibles
	//DiscoveryClientRouteDefinitionLocator crea las rutas automaticamente por un servicio de microservicio
	@Bean
	DiscoveryClientRouteDefinitionLocator dinamicRoute(ReactiveDiscoveryClient rdc, DiscoveryLocatorProperties dlp){
		return new DiscoveryClientRouteDefinitionLocator(rdc, dlp);
	}


}
