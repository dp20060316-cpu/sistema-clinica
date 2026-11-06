package com.clinica.controller;

import com.clinica.entity.EstadoCita;
import com.clinica.repository.CitaRepository;
import com.clinica.repository.MedicoRepository;
import com.clinica.repository.PacienteRepository;
import com.clinica.repository.RecetaRepository;
import java.time.LocalDate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Totales para la pantalla de inicio. */
@RestController
@RequestMapping("/api/resumen")
public class ResumenController {

    public record Resumen(long pacientes, long medicosActivos, long citasHoy, long recetas) {}

    private final PacienteRepository pacientes;
    private final MedicoRepository medicos;
    private final CitaRepository citas;
    private final RecetaRepository recetas;

    public ResumenController(PacienteRepository pacientes, MedicoRepository medicos,
                             CitaRepository citas, RecetaRepository recetas) {
        this.pacientes = pacientes;
        this.medicos = medicos;
        this.citas = citas;
        this.recetas = recetas;
    }

    @GetMapping
    public Resumen obtener() {
        LocalDate hoy = LocalDate.now();
        long citasHoy = citas.countByFechaHoraBetweenAndEstadoNot(
                hoy.atStartOfDay(), hoy.plusDays(1).atStartOfDay().minusSeconds(1), EstadoCita.CANCELADA);
        return new Resumen(pacientes.count(), medicos.countByActivoTrue(), citasHoy, recetas.count());
    }
}
