import { Link, useParams } from 'react-router-dom';
import { useDatos } from '../hooks.js';
import { CLINICA, formatoFechaHora } from '../utils.js';
import { Aviso, Cargando } from '../components/ui.jsx';

// Vista de la receta. Al imprimir, styles.css oculta el menú y los botones.
export default function ImprimirReceta() {
  const { id } = useParams();
  const { datos: receta, error } = useDatos(`/recetas/${id}`);

  if (error) return <Aviso>{error}</Aviso>;
  if (!receta) return <Cargando activo />;

  return (
    <>
      <div className="cabecera no-imprimir">
        <h1>Receta {receta.numero}</h1>
        <div className="acciones">
          <Link className="btn" to={`/pacientes/${receta.pacienteId}`}>
            Ver paciente
          </Link>
          <button className="btn btn-primario" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>
      </div>

      <article className="hoja">
        <header className="hoja-cabecera">
          <div>
            <div className="hoja-clinica">{CLINICA.nombre}</div>
            <div>{CLINICA.direccion}</div>
            <div>Tel. {CLINICA.telefono}</div>
          </div>
          <div className="hoja-numero">
            <strong>Receta {receta.numero}</strong>
            {formatoFechaHora(receta.fecha)}
          </div>
        </header>

        <section className="hoja-datos">
          <div>
            <span className="etiqueta">Paciente: </span>
            {receta.pacienteNombre}
          </div>
          <div>
            <span className="etiqueta">Documento: </span>
            {receta.pacienteDocumento}
          </div>
          <div>
            <span className="etiqueta">Edad: </span>
            {receta.pacienteEdad} años
          </div>
          <div>
            <span className="etiqueta">Alergias: </span>
            {receta.pacienteAlergias || 'Ninguna registrada'}
          </div>
          {receta.diagnostico && (
            <div style={{ gridColumn: '1 / -1' }}>
              <span className="etiqueta">Diagnóstico: </span>
              {receta.diagnostico}
            </div>
          )}
        </section>

        <div className="hoja-rx" aria-hidden="true">
          Rp.
        </div>
        <ol className="hoja-lista">
          {receta.detalles.map((d) => (
            <li key={d.id}>
              <div className="hoja-medicamento">{d.medicamento}</div>
              <div>
                {d.dosis} · {d.frecuencia} · durante {d.duracion}
              </div>
              {d.indicaciones && <div>{d.indicaciones}</div>}
            </li>
          ))}
        </ol>

        {receta.indicaciones && (
          <section className="hoja-indicaciones">
            <span className="etiqueta">Indicaciones: </span>
            {receta.indicaciones}
          </section>
        )}

        <footer className="hoja-firma">
          <strong>{receta.medicoNombre}</strong>
          <div>{receta.medicoEspecialidad}</div>
          <div>Colegiatura {receta.medicoColegiatura}</div>
        </footer>
      </article>
    </>
  );
}
