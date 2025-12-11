package com.example.User_Service.repository;

import com.example.User_Service.entidad.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    Optional<Usuario> findByDni(String dni);
    
    Optional<Usuario> findByCorreo(String correo);
    
    boolean existsByCorreo(String correo);
    
    boolean existsByDni(String dni);
    
}