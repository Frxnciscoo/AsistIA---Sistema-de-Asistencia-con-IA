package com.example.Asistencia_Service.service;

import com.example.Asistencia_Service.client.pythonClient;
import com.example.Asistencia_Service.client.pythonClientEntrenar;
import com.example.Asistencia_Service.dto.IaEntrenarRequest;
import com.example.Asistencia_Service.dto.IaEntrenarResponse;
import org.springframework.stereotype.Service;

@Service
public class EntrenarService {

    private final pythonClientEntrenar pythonClient;

    public EntrenarService(pythonClientEntrenar pythonClient) {
        this.pythonClient = pythonClient;
    }


    public IaEntrenarResponse entrenarUsuario(String dni) {
        String rutaCarpeta = "/dockerprojects/" + dni;

        IaEntrenarRequest request = new IaEntrenarRequest(
                rutaCarpeta,
                dni
        );

        try {
            return pythonClient.entrenarRostro(request);
        } catch (Exception e) {
            throw new RuntimeException("Error al conectar con el servicio de IA para entrenamiento: " + e.getMessage());
        }
    }
}
