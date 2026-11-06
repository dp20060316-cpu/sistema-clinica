package com.clinica.dto;

import com.clinica.entity.Cita;
import com.clinica.entity.EstadoCita;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class CitaDto {

    private CitaDto() {}

    public record Request(
            @NotNull Long pacienteId,
            @NotNull Long medicoId,
            @NotNull Long servicioId,
            @NotNull LocalDateTime fechaHora,
            @Size(max = 300) String motivo) {}

    public record Response(
            Long id,
            Long pacienteId,
            String pacienteNombre,
            String pacienteDocumento,
            Long medicoId,
            String medicoNombre,
            String medicoEspecialidad,
            Long servicioId,
            String servicioNombre,
            BigDecimal servicioPrecio,
            LocalDateTime fechaHora,
            String motivo,
            EstadoCita estado) {

        public static Response from(Cita c) {
            return new Response(
                    c.getId(),
                    c.getPaciente().getId(), c.getPaciente().getNombreCompleto(), c.getPaciente().getDocumento(),
                    c.getMedico().getId(), c.getMedico().getNombreCompleto(), c.getMedico().getEspecialidad(),
                    c.getServicio().getId(), c.getServicio().getNombre(), c.getServicio().getPrecio(),
                    c.getFechaHora(), c.getMotivo(), c.getEstado());
        }
    }
}
