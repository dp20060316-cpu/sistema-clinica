package com.clinica.exception;

/** La operación rompe una regla del sistema, p. ej. un horario ocupado (HTTP 409). */
public class ReglaNegocioException extends RuntimeException {

    public ReglaNegocioException(String mensaje) {
        super(mensaje);
    }
}
