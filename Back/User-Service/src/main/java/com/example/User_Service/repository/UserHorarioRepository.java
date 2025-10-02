package com.example.User_Service.repository;

import com.example.User_Service.entidad.UserHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public interface UserHorarioRepository extends JpaRepository<UserHorario, Long> {

    List<UserHorario> findByUsuario_IdUsuario(Long idUsuario);
}
