package com.example.Asistencia_Service.entidad;


import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "asistencia")
public class Asistencia {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdAsistencia")
    private Long idAsistencia;

    @Column(name = "IdUsuario")
    private Long idUsuario;

    @Column(name = "Fecha")
    private LocalDate fecha;

    @Column(name = "HoraRegistro")
    private LocalTime horaRegistro;

    @Column(name = "TipoEvento")
    private String tipoEvento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idTipoRegistro" , nullable = false)
    TiposRegistro tiposRegistro;

    @Column(name = "Estado", nullable = false)
    private Boolean estado = true;

    @Column(name = "fecharegistro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();


    public Asistencia() {
    }

    public Asistencia(Long idAsistencia, Long idUsuario, LocalDate fecha, LocalTime horaRegistro, String tipoEvento, TiposRegistro tiposRegistro, Boolean estado, LocalDateTime fechaRegistro) {
        this.idAsistencia = idAsistencia;
        this.idUsuario = idUsuario;
        this.fecha = fecha;
        this.horaRegistro = horaRegistro;
        this.tipoEvento = tipoEvento;
        this.tiposRegistro = tiposRegistro;
        this.estado = estado;
        this.fechaRegistro = fechaRegistro;
    }


    public Long getIdAsistencia() {
        return idAsistencia;
    }

    public void setIdAsistencia(Long idAsistencia) {
        this.idAsistencia = idAsistencia;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraRegistro() {
        return horaRegistro;
    }

    public void setHoraRegistro(LocalTime horaRegistro) {
        this.horaRegistro = horaRegistro;
    }

    public String getTipoEvento() {
        return tipoEvento;
    }

    public void setTipoEvento(String tipoEvento) {
        this.tipoEvento = tipoEvento;
    }

    public TiposRegistro getTiposRegistro() {
        return tiposRegistro;
    }

    public void setTiposRegistro(TiposRegistro tiposRegistro) {
        this.tiposRegistro = tiposRegistro;
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
