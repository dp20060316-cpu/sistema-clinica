package com.clinica.controller;

import com.clinica.dto.CitaDto;
import com.clinica.entity.EstadoCita;
import com.clinica.service.CitaService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/citas")
public class CitaController {

    private final CitaService service;

    public CitaController(CitaService service) {
        this.service = service;
    }

    @GetMapping
    public List<CitaDto.Response> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long pacienteId,
            @RequestParam(required = false) Long medicoId,
            @RequestParam(required = false) EstadoCita estado) {
        return service.listar(fecha, pacienteId, medicoId, estado);
    }

    @GetMapping("/{id}")
    public CitaDto.Response obtener(@PathVariable Long id) {
        return service.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CitaDto.Response crear(@Valid @RequestBody CitaDto.Request datos) {
        return service.crear(datos);
    }

    @PutMapping("/{id}")
    public CitaDto.Response actualizar(@PathVariable Long id, @Valid @RequestBody CitaDto.Request datos) {
        return service.actualizar(id, datos);
    }

    @PatchMapping("/{id}/cancelar")
    public CitaDto.Response cancelar(@PathVariable Long id) {
        return service.cancelar(id);
    }
}
