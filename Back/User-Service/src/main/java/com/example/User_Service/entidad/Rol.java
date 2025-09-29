package com.example.User_Service.entidad;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "roles")
public class Rol {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "IdRol")
        private Long idRol;

        @Column(name = "CodigoRol", nullable = false, unique = true, length = 50)
        private String codigoRol;

        @Column(name = "NombreRol", nullable = false, length = 100)
        private String nombreRol;

        @Column(name = "Descripcion", nullable = false, length = 255)
        private String descripcion;

        @Column(name = "Estado", nullable = false)
        private Boolean estado = true;

        @Column(name = "FechaCreacion", nullable = false, updatable = false)
        private LocalDateTime fechaCreacion = LocalDateTime.now();


}
