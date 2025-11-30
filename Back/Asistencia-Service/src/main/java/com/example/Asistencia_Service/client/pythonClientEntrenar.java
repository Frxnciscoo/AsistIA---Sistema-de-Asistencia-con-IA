package com.example.Asistencia_Service.client;

import com.example.Asistencia_Service.dto.IaEntrenarRequest;
import com.example.Asistencia_Service.dto.IaEntrenarResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ia-service-entrenar", url = "http://localhost:5000")
public interface pythonClientEntrenar {


    @PostMapping("/entrenar")
    IaEntrenarResponse entrenarRostro(@RequestBody IaEntrenarRequest request);
}
