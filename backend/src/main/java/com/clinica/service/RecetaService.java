package com.clinica.service;

import com.clinica.dto.RecetaDto;
import com.clinica.entity.HistorialClinico;
import com.clinica.entity.Medico;
import com.clinica.entity.Paciente;
import com.clinica.entity.Receta;
import com.clinica.entity.RecetaDetalle;
import com.clinica.exception.NoEncontradoException;
import com.clinica.exception.ReglaNegocioException;
import com.clinica.repository.RecetaRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RecetaService {

    private final RecetaRepository repo;
    private final PacienteService pacientes;
    private final MedicoService medicos;
    private final HistorialService historiales;

    public RecetaService(RecetaRepository repo, PacienteService pacientes,
                         MedicoService medicos, HistorialService historiales) {
        this.repo = repo;
        this.pacientes = pacientes;
        this.medicos = medicos;
        this.historiales = historiales;
    }

    @Transactional(readOnly = true)
    public List<RecetaDto.Response> listar(Long pacienteId) {
        List<Receta> recetas = pacienteId == null
                ? repo.findAllByOrderByFechaDesc()
                : repo.findByPacienteIdOrderByFechaDesc(pacienteId);
        return recetas.stream().map(RecetaDto.Response::from).toList();
    }

    @Transactional(readOnly = true)
    public RecetaDto.Response obtener(Long id) {
        return RecetaDto.Response.from(buscar(id));
    }

    public RecetaDto.Response crear(RecetaDto.Request datos) {
        Paciente paciente = pacientes.buscar(datos.pacienteId());
        Medico medico = medicos.buscar(datos.medicoId());
        if (!medico.isActivo()) {
            throw new ReglaNegocioException("El médico seleccionado está inactivo.");
        }

        Receta receta = new Receta();
        receta.setPaciente(paciente);
        receta.setMedico(medico);
        receta.setFecha(LocalDateTime.now());
        receta.setIndicaciones(datos.indicaciones());

        if (datos.historialId() != null) {
            HistorialClinico historial = historiales.buscar(datos.historialId());
            if (!historial.getPaciente().getId().equals(paciente.getId())) {
                throw new ReglaNegocioException("La entrada de historial pertenece a otro paciente.");
            }
            receta.setHistorial(historial);
        }

        for (RecetaDto.DetalleRequest d : datos.detalles()) {
            RecetaDetalle detalle = new RecetaDetalle();
            detalle.setMedicamento(d.medicamento());
            detalle.setDosis(d.dosis());
            detalle.setFrecuencia(d.frecuencia());
            detalle.setDuracion(d.duracion());
            detalle.setIndicaciones(d.indicaciones());
            receta.agregarDetalle(detalle);
        }
        return RecetaDto.Response.from(repo.save(receta));
    }

    public void eliminar(Long id) {
        repo.delete(buscar(id));
    }

    private Receta buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new NoEncontradoException("No existe la receta " + id));
    }
}
