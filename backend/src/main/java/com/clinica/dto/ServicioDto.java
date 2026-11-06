package com.clinica.dto;

import com.clinica.entity.Servicio;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public final class ServicioDto {

    private ServicioDto() {}

    public record Request(
            @NotBlank @Size(max = 100) String nombre,
            @Size(max = 300) String descripcion,
            @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal precio,
            boolean activo) {}

    public record Response(Long id, String nombre, String descripcion, BigDecimal precio, boolean activo) {

        public static Response from(Servicio s) {
            return new Response(s.getId(), s.getNombre(), s.getDescripcion(), s.getPrecio(), s.isActivo());
        }
    }
}
