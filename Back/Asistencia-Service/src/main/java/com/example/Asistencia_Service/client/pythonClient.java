package com.example.Asistencia_Service.client;

import com.example.Asistencia_Service.dto.IaRequestDto;
import com.example.Asistencia_Service.dto.IaResponseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "ia-service", url = "http://localhost:5000")
public interface pythonClient {
    @PostMapping("/reconocer")
    IaResponseDto reconocerRostro(@RequestBody IaRequestDto request);
}
