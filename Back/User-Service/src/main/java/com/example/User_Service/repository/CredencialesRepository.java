package com.example.User_Service.repository;

import com.example.User_Service.entidad.Credenciales;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CredencialesRepository extends JpaRepository<Credenciales, Long> {

    Optional<Credenciales> findByUsuario_Correo(String correo);

}
