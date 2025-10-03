package com.example.User_Service.repository;

import com.example.User_Service.entidad.UserHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Service
public interface UserHorarioRepository extends JpaRepository<UserHorario, Long> {

    List<UserHorario> findByUsuario_IdUsuario(Long idUsuario);

    @Query("SELECT uh FROM UserHorario uh " +
            "WHERE uh.usuario.idUsuario = :idUsuario " +
            "AND uh.fechaInicio <= :fecha " +
            "AND (uh.fechaFin IS NULL OR uh.fechaFin >= :fecha)")
    Optional<UserHorario> findHorarioAsignadoPorFecha(@Param("idUsuario") Long idUsuario,
                                                      @Param("fecha") LocalDate fecha);


}
