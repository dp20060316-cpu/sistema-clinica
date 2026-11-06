package com.clinica.dto;

import com.clinica.entity.Receta;
import com.clinica.entity.RecetaDetalle;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public final class RecetaDto {

    private RecetaDto() {}

    public record DetalleRequest(
            @NotBlank @Size(max = 120) String medicamento,
            @NotBlank @Size(max = 60) String dosis,
            @NotBlank @Size(max = 60) String frecuencia,
            @NotBlank @Size(max = 60) String duracion,
            @Size(max = 200) String indicaciones) {}

    public record Request(
            @NotNull Long pacienteId,
            @NotNull Long medicoId,
            Long historialId,
            @Size(max = 1000) String indicaciones,
            @NotEmpty @Valid List<DetalleRequest> detalles) {}

    public record DetalleResponse(
            Long id, String medicamento, String dosis, String frecuencia, String duracion, String indicaciones) {

        static DetalleResponse from(RecetaDetalle d) {
            return new DetalleResponse(
                    d.getId(), d.getMedicamento(), d.getDosis(), d.getFrecuencia(), d.getDuracion(), d.getIndicaciones());
        }
    }

    /** Trae todo lo que necesita la receta impresa. */
    public record Response(
            Long id,
            String numero,
            LocalDateTime fecha,
            Long pacienteId,
            String pacienteNombre,
            String pacienteDocumento,
            int pacienteEdad,
            String pacienteAlergias,
            Long medicoId,
            String medicoNombre,
            String medicoEspecialidad,
            String medicoColegiatura,
            Long historialId,
            String diagnostico,
            String indicaciones,
            List<DetalleResponse> detalles) {

        public static Response from(Receta r) {
            return new Response(
                    r.getId(),
                    String.format("R-%06d", r.getId()),
                    r.getFecha(),
                    r.getPaciente().getId(),
                    r.getPaciente().getNombreCompleto(),
                    r.getPaciente().getDocumento(),
                    PacienteDto.edad(r.getPaciente().getFechaNacimiento()),
                    r.getPaciente().getAlergias(),
                    r.getMedico().getId(),
                    r.getMedico().getNombreCompleto(),
                    r.getMedico().getEspecialidad(),
                    r.getMedico().getColegiatura(),
                    r.getHistorial() == null ? null : r.getHistorial().getId(),
                    r.getHistorial() == null ? null : r.getHistorial().getDiagnostico(),
                    r.getIndicaciones(),
                    r.getDetalles().stream().map(DetalleResponse::from).toList());
        }
    }
}
