import { Link } from 'react-router-dom';
import { useDatos } from '../hooks.js';
import { formatoFecha, formatoHora, hoyISO } from '../utils.js';
import { Aviso, Cargando, EstadoCita } from '../components/ui.jsx';

export default function Inicio() {
  const hoy = hoyISO();
  const resumen = useDatos('/resumen');
  const citas = useDatos(`/citas?fecha=${hoy}`);
  const lista = citas.datos ?? [];

  return (
    <>
      <div className="cabecera">
        <div>
          <h1>Inicio</h1>
          <p className="subtitulo">{formatoFecha(hoy)}</p>
        </div>
        <Link className="btn btn-primario" to="/citas?nueva=1">
          Nueva cita
        </Link>
      </div>

      <Aviso>{resumen.error || citas.error}</Aviso>

      <section className="totales">
        <Total ruta="/citas" valor={resumen.datos?.citasHoy} texto="Citas de hoy" />
        <Total ruta="/pacientes" valor={resumen.datos?.pacientes} texto="Pacientes" />
        <Total ruta="/medicos" valor={resumen.datos?.medicosActivos} texto="Médicos activos" />
        <Total ruta="/recetas" valor={resumen.datos?.recetas} texto="Recetas emitidas" />
      </section>

      <section className="panel">
        <div className="panel-cabecera">
          <h2>Agenda de hoy</h2>
        </div>
        <Cargando activo={citas.cargando && !citas.datos} vacio={!citas.cargando && lista.length === 0} mensajeVacio="No hay citas para hoy." />
        {lista.length > 0 && (
          <div className="tabla-marco">
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Servicio</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lista.map((c) => (
                  <tr key={c.id}>
                    <td>{formatoHora(c.fechaHora)}</td>
                    <td>
                      <Link to={`/pacientes/${c.pacienteId}`}>{c.pacienteNombre}</Link>
                    </td>
                    <td>{c.medicoNombre}</td>
                    <td>{c.servicioNombre}</td>
                    <td>
                      <EstadoCita estado={c.estado} />
                    </td>
                    <td>
                      {c.estado === 'PROGRAMADA' && (
                        <div className="celda-acciones">
                          <Link className="btn btn-chico" to={`/citas/${c.id}/atender`}>
                            Atender
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

function Total({ ruta, valor, texto }) {
  return (
    <Link className="total" to={ruta}>
      <strong>{valor ?? '–'}</strong>
      <span>{texto}</span>
    </Link>
  );
}
