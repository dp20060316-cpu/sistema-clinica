package com.clinica.dto;

import com.clinica.entity.Medico;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class MedicoDto {

    private MedicoDto() {}

    public record Request(
            @NotBlank @Size(max = 20) String colegiatura,
            @NotBlank @Size(max = 80) String nombres,
            @NotBlank @Size(max = 80) String apellidos,
            @NotBlank @Size(max = 80) String especialidad,
            @Size(max = 20) String telefono,
            @Email @Size(max = 120) String correo,
            boolean activo) {}

    public record Response(
            Long id,
            String colegiatura,
            String nombres,
            String apellidos,
            String nombreCompleto,
            String especialidad,
            String telefono,
            String correo,
            boolean activo) {

        public static Response from(Medico m) {
            return new Response(
                    m.getId(), m.getColegiatura(), m.getNombres(), m.getApellidos(), m.getNombreCompleto(),
                    m.getEspecialidad(), m.getTelefono(), m.getCorreo(), m.isActivo());
        }
    }
}
