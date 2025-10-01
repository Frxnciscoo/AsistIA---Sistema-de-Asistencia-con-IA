package com.example.Asistencia_Service.repository;

import com.example.Asistencia_Service.entidad.TiposRegistro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface TiposRegistroRepository extends JpaRepository<TiposRegistro, Long> {
}
