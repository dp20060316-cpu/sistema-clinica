package com.clinica.dto;

import com.clinica.entity.Paciente;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.Period;

public final class PacienteDto {

    private PacienteDto() {}

    public record Request(
            @NotBlank @Size(max = 20) String documento,
            @NotBlank @Size(max = 80) String nombres,
            @NotBlank @Size(max = 80) String apellidos,
            @NotNull @PastOrPresent LocalDate fechaNacimiento,
            @NotBlank @Pattern(regexp = "[FMO]") String sexo,
            @Size(max = 20) String telefono,
            @Email @Size(max = 120) String correo,
            @Size(max = 200) String direccion,
            @Size(max = 3) String tipoSangre,
            @Size(max = 300) String alergias) {}

    public record Response(
            Long id,
            String documento,
            String nombres,
            String apellidos,
            String nombreCompleto,
            LocalDate fechaNacimiento,
            int edad,
            String sexo,
            String telefono,
            String correo,
            String direccion,
            String tipoSangre,
            String alergias) {

        public static Response from(Paciente p) {
            return new Response(
                    p.getId(), p.getDocumento(), p.getNombres(), p.getApellidos(), p.getNombreCompleto(),
                    p.getFechaNacimiento(), PacienteDto.edad(p.getFechaNacimiento()), p.getSexo(), p.getTelefono(),
                    p.getCorreo(), p.getDireccion(), p.getTipoSangre(), p.getAlergias());
        }
    }

    public static int edad(LocalDate fechaNacimiento) {
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }
}
