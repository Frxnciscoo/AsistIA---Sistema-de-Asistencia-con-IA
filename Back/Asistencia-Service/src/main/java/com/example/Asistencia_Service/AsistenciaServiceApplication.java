package com.example.Asistencia_Service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients
@SpringBootApplication
public class 	AsistenciaServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AsistenciaServiceApplication.class, args);
	}

}
