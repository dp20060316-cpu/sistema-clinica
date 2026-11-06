package com.clinica.service;

import com.clinica.dto.HistorialDto;
import com.clinica.entity.Cita;
import com.clinica.entity.HistorialClinico;
import com.clinica.exception.NoEncontradoException;
import com.clinica.exception.ReglaNegocioException;
import com.clinica.repository.HistorialRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class HistorialService {

    private final HistorialRepository repo;
    private final PacienteService pacientes;
    private final MedicoService medicos;
    private final CitaService citas;

    public HistorialService(HistorialRepository repo, PacienteService pacientes,
                            MedicoService medicos, CitaService citas) {
        this.repo = repo;
        this.pacientes = pacientes;
        this.medicos = medicos;
        this.citas = citas;
    }

    @Transactional(readOnly = true)
    public List<HistorialDto.Response> listarPorPaciente(Long pacienteId) {
        pacientes.buscar(pacienteId);
        return repo.findByPacienteIdOrderByFechaDesc(pacienteId).stream()
                .map(HistorialDto.Response::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public HistorialDto.Response obtener(Long id) {
        return HistorialDto.Response.from(buscar(id));
    }

    /** Registra una atención. Si viene de una cita, la cita pasa a ATENDIDA. */
    public HistorialDto.Response crear(HistorialDto.Request datos) {
        HistorialClinico historial = new HistorialClinico();
        if (datos.citaId() != null) {
            Cita cita = citas.buscar(datos.citaId());
            citas.marcarAtendida(cita);
            historial.setCita(cita);
            historial.setPaciente(cita.getPaciente());
            historial.setMedico(cita.getMedico());
        } else {
            if (datos.pacienteId() == null || datos.medicoId() == null) {
                throw new ReglaNegocioException("Debes indicar el paciente y el médico.");
            }
            historial.setPaciente(pacientes.buscar(datos.pacienteId()));
            historial.setMedico(medicos.buscar(datos.medicoId()));
        }
        historial.setFecha(LocalDateTime.now());
        copiar(datos, historial);
        return HistorialDto.Response.from(repo.save(historial));
    }

    /** Solo cambia los datos clínicos; el paciente, el médico y la fecha no se tocan. */
    public HistorialDto.Response actualizar(Long id, HistorialDto.Request datos) {
        HistorialClinico historial = buscar(id);
        copiar(datos, historial);
        return HistorialDto.Response.from(historial);
    }

    public HistorialClinico buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new NoEncontradoException("No existe la entrada de historial " + id));
    }

    private void copiar(HistorialDto.Request d, HistorialClinico h) {
        h.setMotivoConsulta(d.motivoConsulta());
        h.setDiagnostico(d.diagnostico());
        h.setTratamiento(d.tratamiento());
        h.setObservaciones(d.observaciones());
        h.setPresionArterial(d.presionArterial());
        h.setTemperatura(d.temperatura());
        h.setPesoKg(d.pesoKg());
        h.setTallaCm(d.tallaCm());
    }
}
