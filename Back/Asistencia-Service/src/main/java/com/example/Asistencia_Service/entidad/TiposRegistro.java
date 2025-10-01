package com.example.Asistencia_Service.entidad;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tiposregistro")
public class TiposRegistro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdTipoRegistro  ")
    private Long idTipoRegistro;


    @Column(name = "NombreTipo" , nullable = false)
    private String nombreTipo;

    @Column(name = "Estado", nullable = false)
    private Boolean estado = true;

    @Column(name = "FechaCreacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public TiposRegistro() {
    }


    public TiposRegistro(Long idTipoRegistro, String nombreTipo, Boolean estado, LocalDateTime fechaCreacion) {
        this.idTipoRegistro = idTipoRegistro;
        this.nombreTipo = nombreTipo;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getIdTipoRegistro() {
        return idTipoRegistro;
    }

    public void setIdTipoRegistro(Long idTipoRegistro) {
        this.idTipoRegistro = idTipoRegistro;
    }

    public String getNombreTipo() {
        return nombreTipo;
    }

    public void setNombreTipo(String nombreTipo) {
        this.nombreTipo = nombreTipo;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }


}
