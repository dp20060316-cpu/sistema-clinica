package com.clinica.exception;

/** El registro pedido no existe (HTTP 404). */
public class NoEncontradoException extends RuntimeException {

    public NoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
