package com.clinica.controller;

import com.clinica.dto.HistorialDto;
import com.clinica.dto.PacienteDto;
import com.clinica.service.HistorialService;
import com.clinica.service.PacienteService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    private final PacienteService service;
    private final HistorialService historial;

    public PacienteController(PacienteService service, HistorialService historial) {
        this.service = service;
        this.historial = historial;
    }

    @GetMapping
    public List<PacienteDto.Response> listar(@RequestParam(required = false) String q) {
        return service.listar(q);
    }

    @GetMapping("/{id}")
    public PacienteDto.Response obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @GetMapping("/{id}/historial")
    public List<HistorialDto.Response> historial(@PathVariable Long id) {
        return historial.listarPorPaciente(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PacienteDto.Response crear(@Valid @RequestBody PacienteDto.Request datos) {
        return service.crear(datos);
    }

    @PutMapping("/{id}")
    public PacienteDto.Response actualizar(@PathVariable Long id, @Valid @RequestBody PacienteDto.Request datos) {
        return service.actualizar(id, datos);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        service.eliminar(id);
    }
}
