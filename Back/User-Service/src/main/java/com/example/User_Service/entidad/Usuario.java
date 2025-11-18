package com.example.User_Service.entidad;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Table(name = "usuarios")
@Entity
public class Usuario {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdUsuario")
    private Long idUsuario ;

    @Column(name = "Nombre" , nullable = false)
    private String nombre;

    @Column(name = "Apellido" , nullable = false)
    private String apellido;

    @Column(name = "Correo" , nullable = false, unique = true)
    private String correo;

    @Column(name = "DNI", nullable = false, unique = true)
    private String dni;

    @ManyToOne(fetch = FetchType.LAZY) // Es buena práctica ser explícito con el tipo de fetch
    @JoinColumn(name = "IdRol" , nullable = false)
    private Rol rol;

    @Column(name = "Estado", nullable = false)
    private Boolean estado = true;

    @Column(name = "FechaCreacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "imagen")
    private String imagen;

    public Usuario() {
    }

    public Usuario(Long idUsuario, String nombre, String apellido, String correo, String dni, Boolean estado, Rol rol, LocalDateTime fechaCreacion, String imagen) {
        this.idUsuario = idUsuario;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.dni = dni;
        this.estado = estado;
        this.rol = rol;
        this.fechaCreacion = fechaCreacion;
        this.imagen = imagen;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
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

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }
}
