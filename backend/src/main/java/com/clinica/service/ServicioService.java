package com.clinica.service;

import com.clinica.dto.ServicioDto;
import com.clinica.entity.Servicio;
import com.clinica.exception.NoEncontradoException;
import com.clinica.exception.ReglaNegocioException;
import com.clinica.repository.ServicioRepository;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ServicioService {

    private final ServicioRepository repo;

    public ServicioService(ServicioRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<ServicioDto.Response> listar() {
        return repo.findAll(Sort.by("nombre")).stream()
                .map(ServicioDto.Response::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServicioDto.Response obtener(Long id) {
        return ServicioDto.Response.from(buscar(id));
    }

    public ServicioDto.Response crear(ServicioDto.Request datos) {
        validarNombre(datos.nombre(), -1L);
        Servicio servicio = new Servicio();
        copiar(datos, servicio);
        return ServicioDto.Response.from(repo.save(servicio));
    }

    public ServicioDto.Response actualizar(Long id, ServicioDto.Request datos) {
        Servicio servicio = buscar(id);
        validarNombre(datos.nombre(), id);
        copiar(datos, servicio);
        return ServicioDto.Response.from(servicio);
    }

    public void eliminar(Long id) {
        repo.delete(buscar(id));
    }

    public Servicio buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new NoEncontradoException("No existe el servicio " + id));
    }

    private void validarNombre(String nombre, Long idActual) {
        if (repo.existsByNombreIgnoreCaseAndIdNot(nombre, idActual)) {
            throw new ReglaNegocioException("Ya existe un servicio llamado " + nombre);
        }
    }

    private void copiar(ServicioDto.Request d, Servicio s) {
        s.setNombre(d.nombre());
        s.setDescripcion(d.descripcion());
        s.setPrecio(d.precio());
        s.setActivo(d.activo());
    }
}
