package com.clinica.service;

import com.clinica.dto.CitaDto;
import com.clinica.entity.Cita;
import com.clinica.entity.EstadoCita;
import com.clinica.entity.Medico;
import com.clinica.entity.Paciente;
import com.clinica.entity.Servicio;
import com.clinica.exception.NoEncontradoException;
import com.clinica.exception.ReglaNegocioException;
import com.clinica.repository.CitaRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CitaService {

    /** Cada cita ocupa 30 minutos de agenda. */
    private static final int MINUTOS_POR_CITA = 30;

    private final CitaRepository repo;
    private final PacienteService pacientes;
    private final MedicoService medicos;
    private final ServicioService servicios;

    public CitaService(CitaRepository repo, PacienteService pacientes,
                       MedicoService medicos, ServicioService servicios) {
        this.repo = repo;
        this.pacientes = pacientes;
        this.medicos = medicos;
        this.servicios = servicios;
    }

    @Transactional(readOnly = true)
    public List<CitaDto.Response> listar(LocalDate fecha, Long pacienteId, Long medicoId, EstadoCita estado) {
        Specification<Cita> filtros = (root, query, cb) -> {
            List<Predicate> condiciones = new ArrayList<>();
            if (fecha != null) {
                condiciones.add(cb.greaterThanOrEqualTo(root.<LocalDateTime>get("fechaHora"), fecha.atStartOfDay()));
                condiciones.add(cb.lessThan(root.<LocalDateTime>get("fechaHora"), fecha.plusDays(1).atStartOfDay()));
            }
            if (pacienteId != null) {
                condiciones.add(cb.equal(root.get("paciente").get("id"), pacienteId));
            }
            if (medicoId != null) {
                condiciones.add(cb.equal(root.get("medico").get("id"), medicoId));
            }
            if (estado != null) {
                condiciones.add(cb.equal(root.get("estado"), estado));
            }
            return cb.and(condiciones.toArray(new Predicate[0]));
        };
        return repo.findAll(filtros, Sort.by("fechaHora")).stream().map(CitaDto.Response::from).toList();
    }

    @Transactional(readOnly = true)
    public CitaDto.Response obtener(Long id) {
        return CitaDto.Response.from(buscar(id));
    }

    public CitaDto.Response crear(CitaDto.Request datos) {
        Cita cita = new Cita();
        aplicar(datos, cita, -1L);
        return CitaDto.Response.from(repo.save(cita));
    }

    public CitaDto.Response actualizar(Long id, CitaDto.Request datos) {
        Cita cita = buscar(id);
        exigirProgramada(cita, "editar");
        aplicar(datos, cita, id);
        return CitaDto.Response.from(cita);
    }

    public CitaDto.Response cancelar(Long id) {
        Cita cita = buscar(id);
        exigirProgramada(cita, "cancelar");
        cita.setEstado(EstadoCita.CANCELADA);
        return CitaDto.Response.from(cita);
    }

    /** La usa HistorialService al registrar la atención de una cita. */
    public void marcarAtendida(Cita cita) {
        exigirProgramada(cita, "atender");
        cita.setEstado(EstadoCita.ATENDIDA);
    }

    public Cita buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new NoEncontradoException("No existe la cita " + id));
    }

    private void aplicar(CitaDto.Request d, Cita cita, Long idActual) {
        Paciente paciente = pacientes.buscar(d.pacienteId());
        Medico medico = medicos.buscar(d.medicoId());
        Servicio servicio = servicios.buscar(d.servicioId());

        if (!medico.isActivo()) {
            throw new ReglaNegocioException("El médico seleccionado está inactivo.");
        }
        if (!servicio.isActivo()) {
            throw new ReglaNegocioException("El servicio seleccionado está inactivo.");
        }
        if (d.fechaHora().isBefore(LocalDateTime.now())) {
            throw new ReglaNegocioException("No se puede programar una cita en una fecha pasada.");
        }
        validarHorario(paciente, medico, d.fechaHora(), idActual);

        cita.setPaciente(paciente);
        cita.setMedico(medico);
        cita.setServicio(servicio);
        cita.setFechaHora(d.fechaHora());
        cita.setMotivo(d.motivo());
    }

    private void validarHorario(Paciente paciente, Medico medico, LocalDateTime fechaHora, Long idActual) {
        LocalDateTime desde = fechaHora.minusMinutes(MINUTOS_POR_CITA - 1);
        LocalDateTime hasta = fechaHora.plusMinutes(MINUTOS_POR_CITA - 1);

        if (repo.existsByMedicoIdAndEstadoNotAndFechaHoraBetweenAndIdNot(
                medico.getId(), EstadoCita.CANCELADA, desde, hasta, idActual)) {
            throw new ReglaNegocioException("El médico ya tiene una cita en ese horario.");
        }
        if (repo.existsByPacienteIdAndEstadoNotAndFechaHoraBetweenAndIdNot(
                paciente.getId(), EstadoCita.CANCELADA, desde, hasta, idActual)) {
            throw new ReglaNegocioException("El paciente ya tiene una cita en ese horario.");
        }
    }

    private void exigirProgramada(Cita cita, String accion) {
        if (cita.getEstado() != EstadoCita.PROGRAMADA) {
            throw new ReglaNegocioException("Solo se puede " + accion + " una cita programada.");
        }
    }
}
