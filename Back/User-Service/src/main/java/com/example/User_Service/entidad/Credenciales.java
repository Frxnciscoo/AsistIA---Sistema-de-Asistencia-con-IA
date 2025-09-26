package com.example.User_Service.entidad;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "credenciales")
public class Credenciales {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdCredencial")
    private Long idCredencial;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdUsuario")
    private Usuario usuario;

    @Column(name = "ContrasenaHash" , nullable = false)
    private String contrasenaHash;

    @Column(name = "Estado", nullable = false)
    private Boolean estado = true;

    @Column(name = "FechaCreacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public Credenciales() {
    }

    public Credenciales(Long idCredencial, Usuario usuario, Boolean estado, String contrasenaHash, LocalDateTime fechaCreacion) {
        this.idCredencial = idCredencial;
        this.usuario = usuario;
        this.estado = estado;
        this.contrasenaHash = contrasenaHash;
        this.fechaCreacion = fechaCreacion;
    }

    public Credenciales(Usuario usuario, String contrasenaEncriptada) {
        this.usuario = usuario;
        this.contrasenaHash = contrasenaEncriptada;
    }


    public Long getIdCredencial() {
        return idCredencial;
    }

    public void setIdCredencial(Long idCredencial) {
        this.idCredencial = idCredencial;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getContrasenaHash() {
        return contrasenaHash;
    }

    public void setContrasenaHash(String contrasenaHash) {
        this.contrasenaHash = contrasenaHash;
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
