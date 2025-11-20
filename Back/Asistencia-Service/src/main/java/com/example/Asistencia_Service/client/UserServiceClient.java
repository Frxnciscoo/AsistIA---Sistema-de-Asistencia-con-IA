package com.example.Asistencia_Service.client;

import com.example.Asistencia_Service.dto.HorarioAsinadoDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.example.Asistencia_Service.config.FeignClientConfig;

@FeignClient(name = "User-Service" , configuration = FeignClientConfig.class)
public interface UserServiceClient {

    @GetMapping("/Usuarios/{idUsuario}/horario-actual")
    HorarioAsinadoDto obtenerHorarioActual(@PathVariable("idUsuario") Long idUsuario);

    @GetMapping("/Usuarios/internal/buscar-por-dni/{dni}")
    Long obtenerIdPorDni(@PathVariable("dni") String dni);

}
