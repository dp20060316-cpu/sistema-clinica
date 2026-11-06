import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useDatos } from '../hooks.js';
import { formatoFechaHora } from '../utils.js';
import { Aviso, Cargando } from '../components/ui.jsx';

export default function Recetas() {
  const { datos, error, cargando, recargar } = useDatos('/recetas');
  const [errorAccion, setErrorAccion] = useState('');
  const recetas = datos ?? [];

  async function eliminar(receta) {
    if (!window.confirm(`¿Eliminar la receta ${receta.numero}?`)) return;
    setErrorAccion('');
    try {
      await api.del(`/recetas/${receta.id}`);
      recargar();
    } catch (e) {
      setErrorAccion(e.message);
    }
  }

  return (
    <>
      <div className="cabecera">
        <h1>Recetas</h1>
        <Link className="btn btn-primario" to="/recetas/nueva">
          Nueva receta
        </Link>
      </div>

      <Aviso>{error || errorAccion}</Aviso>

      <section className="panel">
        <Cargando activo={cargando && !datos} vacio={!cargando && recetas.length === 0} mensajeVacio="Todavía no hay recetas." />
        {recetas.length > 0 && (
          <div className="tabla-marco">
            <table>
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Medicamentos</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recetas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.numero}</td>
                    <td>{formatoFechaHora(r.fecha)}</td>
                    <td>
                      <Link to={`/pacientes/${r.pacienteId}`}>{r.pacienteNombre}</Link>
                    </td>
                    <td>{r.medicoNombre}</td>
                    <td>{r.detalles.map((d) => d.medicamento).join(', ')}</td>
                    <td>
                      <div className="celda-acciones">
                        <Link className="btn btn-chico" to={`/recetas/${r.id}`}>
                          Ver e imprimir
                        </Link>
                        <button className="btn btn-chico btn-peligro" onClick={() => eliminar(r)}>
                          Eliminar
                        </button>
                      </div>
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
