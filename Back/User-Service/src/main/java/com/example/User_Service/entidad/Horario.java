package com.example.User_Service.entidad;


import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "horarios")
public class Horario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdHorario")
    private Long idHorario;

    //segun base de datos este es unico
    @Column(name = "NombreHorario", nullable = false, unique = true)
    private String nombreHorario;

    @Column(name = "HoraEntrada", nullable = false)
    private LocalTime horaEntrada;

    @Column(name = "HoraSalida", nullable = false)
    private LocalTime horaSalida;


    //segun base de datos este atributo se inicializa en 10
    @Column(name = "ToleranciaMin")
    private Integer toleranciaMin = 10;

    @Column(name = "Estado", nullable = false)
    private Boolean estado = true;

    @Column(name = "FechaCreacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public Horario() {
    }

    public Horario(Long idHorario, String nombreHorario, LocalTime horaEntrada, LocalTime horaSalida, Integer toleranciaMin, Boolean estado, LocalDateTime fechaCreacion) {
        this.idHorario = idHorario;
        this.nombreHorario = nombreHorario;
        this.horaEntrada = horaEntrada;
        this.horaSalida = horaSalida;
        this.toleranciaMin = toleranciaMin;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getIdHorario() {
        return idHorario;
    }

    public void setIdHorario(Long idHorario) {
        this.idHorario = idHorario;
    }

    public String getNombreHorario() {
        return nombreHorario;
    }

    public void setNombreHorario(String nombreHorario) {
        this.nombreHorario = nombreHorario;
    }

    public LocalTime getHoraEntrada() {
        return horaEntrada;
    }

    public void setHoraEntrada(LocalTime horaEntrada) {
        this.horaEntrada = horaEntrada;
    }

    public LocalTime getHoraSalida() {
        return horaSalida;
    }

    public void setHoraSalida(LocalTime horaSalida) {
        this.horaSalida = horaSalida;
    }

    public Integer getToleranciaMin() {
        return toleranciaMin;
    }

    public void setToleranciaMin(Integer toleranciaMin) {
        this.toleranciaMin = toleranciaMin;
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
