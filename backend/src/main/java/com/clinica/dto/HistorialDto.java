package com.clinica.dto;

import com.clinica.entity.HistorialClinico;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public final class HistorialDto {

    private HistorialDto() {}

    /** Si llega citaId, el paciente y el médico se toman de la cita. */
    public record Request(
            Long pacienteId,
            Long medicoId,
            Long citaId,
            @NotBlank @Size(max = 300) String motivoConsulta,
            @NotBlank @Size(max = 1000) String diagnostico,
            @Size(max = 1000) String tratamiento,
            @Size(max = 1000) String observaciones,
            @Size(max = 10) String presionArterial,
            @DecimalMin("0.0") @Digits(integer = 3, fraction = 1) BigDecimal temperatura,
            @DecimalMin("0.0") @Digits(integer = 3, fraction = 2) BigDecimal pesoKg,
            @DecimalMin("0.0") @Digits(integer = 3, fraction = 2) BigDecimal tallaCm) {}

    public record Response(
            Long id,
            Long pacienteId,
            String pacienteNombre,
            Long medicoId,
            String medicoNombre,
            String medicoEspecialidad,
            Long citaId,
            LocalDateTime fecha,
            String motivoConsulta,
            String diagnostico,
            String tratamiento,
            String observaciones,
            String presionArterial,
            BigDecimal temperatura,
            BigDecimal pesoKg,
            BigDecimal tallaCm) {

        public static Response from(HistorialClinico h) {
            return new Response(
                    h.getId(),
                    h.getPaciente().getId(), h.getPaciente().getNombreCompleto(),
                    h.getMedico().getId(), h.getMedico().getNombreCompleto(), h.getMedico().getEspecialidad(),
                    h.getCita() == null ? null : h.getCita().getId(),
                    h.getFecha(), h.getMotivoConsulta(), h.getDiagnostico(), h.getTratamiento(),
                    h.getObservaciones(), h.getPresionArterial(), h.getTemperatura(), h.getPesoKg(), h.getTallaCm());
        }
    }
}
