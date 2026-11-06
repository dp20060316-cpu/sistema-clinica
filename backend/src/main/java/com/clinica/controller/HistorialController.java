package com.clinica.controller;

import com.clinica.dto.HistorialDto;
import com.clinica.service.HistorialService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** El historial de un paciente se lista en GET /api/pacientes/{id}/historial. */
@RestController
@RequestMapping("/api/historial")
public class HistorialController {

    private final HistorialService service;

    public HistorialController(HistorialService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public HistorialDto.Response obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HistorialDto.Response crear(@Valid @RequestBody HistorialDto.Request datos) {
        return service.crear(datos);
    }

    @PutMapping("/{id}")
    public HistorialDto.Response actualizar(@PathVariable Long id, @Valid @RequestBody HistorialDto.Request datos) {
        return service.actualizar(id, datos);
    }
}
