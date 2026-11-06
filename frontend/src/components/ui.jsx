import { useEffect } from 'react';
import { ESTADOS_CITA } from '../utils.js';

export function Modal({ titulo, onCerrar, children }) {
  useEffect(() => {
    const alPresionar = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onCerrar]);

  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo}>
        <header className="modal-cabecera">
          <h2>{titulo}</h2>
          <button type="button" className="btn-icono" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Campo({ etiqueta, ancho, children }) {
  return (
    <label className={ancho ? 'campo campo-ancho' : 'campo'}>
      <span>{etiqueta}</span>
      {children}
    </label>
  );
}

export function Aviso({ children }) {
  return children ? (
    <p className="aviso" role="alert">
      {children}
    </p>
  ) : null;
}

export function EstadoCita({ estado }) {
  return <span className={`pill pill-${estado.toLowerCase()}`}>{ESTADOS_CITA[estado]}</span>;
}

export function Cargando({ activo, vacio, mensajeVacio }) {
  if (activo) return <p className="vacio">Cargando…</p>;
  if (vacio) return <p className="vacio">{mensajeVacio}</p>;
  return null;
}
