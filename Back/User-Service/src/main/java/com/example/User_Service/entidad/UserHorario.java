package com.example.User_Service.entidad;


import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuario_horario")
public class UserHorario {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUsuarioHorario;


    @ManyToOne
    @JoinColumn(name = "idUsuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "idHorario")
    private Horario horario;

    @Column(name = "FechaInicio")
    LocalDate fechaInicio;


    @Column(name = "FechaFin")
    LocalDate fechaFin;

    @Column(name = "Estado", nullable = false)
    private Boolean estado = true;

    @Column(name = "FechaRegistro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();


    public UserHorario() {
    }

    public UserHorario(Long idUsuarioHorario, Usuario usuario, Horario horario, LocalDate fechaInicio, LocalDate fechaFin, Boolean estado, LocalDateTime fechaRegistro) {
        this.idUsuarioHorario = idUsuarioHorario;
        this.usuario = usuario;
        this.horario = horario;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = estado;
        this.fechaRegistro = fechaRegistro;
    }


    public Long getIdUsuarioHorario() {
        return idUsuarioHorario;
    }

    public void setIdUsuarioHorario(Long idUsuarioHorario) {
        this.idUsuarioHorario = idUsuarioHorario;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Horario getHorario() {
        return horario;
    }

    public void setHorario(Horario horario) {
        this.horario = horario;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Boolean getEstado() {
        return estado;
    }

    public void setEstado(Boolean estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}
