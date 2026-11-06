package com.clinica.service;

import com.clinica.dto.PacienteDto;
import com.clinica.entity.Paciente;
import com.clinica.exception.NoEncontradoException;
import com.clinica.exception.ReglaNegocioException;
import com.clinica.repository.PacienteRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PacienteService {

    private final PacienteRepository repo;

    public PacienteService(PacienteRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<PacienteDto.Response> listar(String texto) {
        List<Paciente> pacientes = (texto == null || texto.isBlank())
                ? repo.findAll(Sort.by("apellidos", "nombres"))
                : repo.buscar(texto.trim());
        return pacientes.stream().map(PacienteDto.Response::from).toList();
    }

    @Transactional(readOnly = true)
    public PacienteDto.Response obtener(Long id) {
        return PacienteDto.Response.from(buscar(id));
    }

    public PacienteDto.Response crear(PacienteDto.Request datos) {
        validarDocumento(datos.documento(), -1L);
        Paciente paciente = new Paciente();
        copiar(datos, paciente);
        return PacienteDto.Response.from(repo.save(paciente));
    }

    public PacienteDto.Response actualizar(Long id, PacienteDto.Request datos) {
        Paciente paciente = buscar(id);
        validarDocumento(datos.documento(), id);
        copiar(datos, paciente);
        return PacienteDto.Response.from(paciente);
    }

    public void eliminar(Long id) {
        repo.delete(buscar(id));
    }

    public Paciente buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new NoEncontradoException("No existe el paciente " + id));
    }

    private void validarDocumento(String documento, Long idActual) {
        if (repo.existsByDocumentoAndIdNot(documento, idActual)) {
            throw new ReglaNegocioException("Ya existe un paciente con el documento " + documento);
        }
    }

    private void copiar(PacienteDto.Request d, Paciente p) {
        p.setDocumento(d.documento());
        p.setNombres(d.nombres());
        p.setApellidos(d.apellidos());
        p.setFechaNacimiento(d.fechaNacimiento());
        p.setSexo(d.sexo());
        p.setTelefono(d.telefono());
        p.setCorreo(d.correo());
        p.setDireccion(d.direccion());
        p.setTipoSangre(d.tipoSangre());
        p.setAlergias(d.alergias());
    }
}
