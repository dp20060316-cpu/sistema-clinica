package com.clinica.service;

import com.clinica.dto.MedicoDto;
import com.clinica.entity.Medico;
import com.clinica.exception.NoEncontradoException;
import com.clinica.exception.ReglaNegocioException;
import com.clinica.repository.MedicoRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MedicoService {

    private final MedicoRepository repo;

    public MedicoService(MedicoRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<MedicoDto.Response> listar() {
        return repo.findAll(Sort.by("apellidos", "nombres")).stream()
                .map(MedicoDto.Response::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedicoDto.Response obtener(Long id) {
        return MedicoDto.Response.from(buscar(id));
    }

    public MedicoDto.Response crear(MedicoDto.Request datos) {
        validarColegiatura(datos.colegiatura(), -1L);
        Medico medico = new Medico();
        copiar(datos, medico);
        return MedicoDto.Response.from(repo.save(medico));
    }

    public MedicoDto.Response actualizar(Long id, MedicoDto.Request datos) {
        Medico medico = buscar(id);
        validarColegiatura(datos.colegiatura(), id);
        copiar(datos, medico);
        return MedicoDto.Response.from(medico);
    }

    public void eliminar(Long id) {
        repo.delete(buscar(id));
    }

    public Medico buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new NoEncontradoException("No existe el médico " + id));
    }

    private void validarColegiatura(String colegiatura, Long idActual) {
        if (repo.existsByColegiaturaAndIdNot(colegiatura, idActual)) {
            throw new ReglaNegocioException("Ya existe un médico con la colegiatura " + colegiatura);
        }
    }

    private void copiar(MedicoDto.Request d, Medico m) {
        m.setColegiatura(d.colegiatura());
        m.setNombres(d.nombres());
        m.setApellidos(d.apellidos());
        m.setEspecialidad(d.especialidad());
        m.setTelefono(d.telefono());
        m.setCorreo(d.correo());
        m.setActivo(d.activo());
    }
}
