package com.example.User_Service.repository;

import com.example.User_Service.entidad.Horario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface HorarioRepository extends JpaRepository<Horario, Long> {
    boolean existsBynombreHorario(String nombreHorario);
}
