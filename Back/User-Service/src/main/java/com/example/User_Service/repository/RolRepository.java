package com.example.User_Service.repository;

import com.example.User_Service.entidad.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource
public interface RolRepository extends JpaRepository<Rol, Long> {
}
