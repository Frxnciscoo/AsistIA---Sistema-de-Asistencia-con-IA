package com.example.Asistencia_Service.repository;

import com.example.Asistencia_Service.entidad.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia,Long> {
}
