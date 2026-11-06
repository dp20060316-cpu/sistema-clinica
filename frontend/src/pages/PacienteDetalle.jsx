import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useDatos } from '../hooks.js';
import { SEXOS, formatoDinero, formatoFecha, formatoFechaHora } from '../utils.js';
import { Aviso, Cargando, EstadoCita, Modal } from '../components/ui.jsx';
import PacienteForm from '../components/PacienteForm.jsx';
import HistorialForm from '../components/HistorialForm.jsx';

export default function PacienteDetalle() {
  const { id } = useParams();
  const navegar = useNavigate();
  const paciente = useDatos(`/pacientes/${id}`);
  const historial = useDatos(`/pacientes/${id}/historial`);
  const citas = useDatos(`/citas?pacienteId=${id}`);
  const recetas = useDatos(`/recetas?pacienteId=${id}`);

  const [pestana, setPestana] = useState('historial');
  const [editando, setEditando] = useState(false);
  // null: cerrado, 'nueva': entrada nueva, objeto: entrada a editar
  const [formHistorial, setFormHistorial] = useState(null);
  const [error, setError] = useState('');

  const p = paciente.datos;

  async function eliminar() {
    if (!window.confirm(`¿Eliminar a ${p.nombreCompleto}?`)) return;
    try {
      await api.del(`/pacientes/${id}`);
      navegar('/pacientes');
    } catch (e) {
      setError(e.message);
    }
  }

  function historialGuardado(entrada, crearReceta) {
    if (crearReceta) {
      navegar(`/recetas/nueva?historialId=${entrada.id}`);
      return;
    }
    setFormHistorial(null);
    historial.recargar();
  }

  if (paciente.error) return <Aviso>{paciente.error}</Aviso>;
  if (!p) return <Cargando activo />;

  return (
    <>
      <div className="cabecera">
        <div>
          <h1>{p.nombreCompleto}</h1>
          <p className="subtitulo">
            Documento {p.documento} · {p.edad} años
          </p>
        </div>
        <div className="acciones">
          <button className="btn" onClick={() => setEditando(true)}>
            Editar
          </button>
          <button className="btn btn-peligro" onClick={eliminar}>
            Eliminar
          </button>
        </div>
      </div>

      <Aviso>{error}</Aviso>

      <section className="panel">
        <div className="panel-cuerpo">
          {p.alergias && (
            <p className="alergia" style={{ marginTop: 0 }}>
              Alergias: {p.alergias}
            </p>
          )}
          <dl className="ficha">
            <Dato titulo="Nacimiento" valor={formatoFecha(p.fechaNacimiento)} />
            <Dato titulo="Sexo" valor={SEXOS[p.sexo]} />
            <Dato titulo="Tipo de sangre" valor={p.tipoSangre} />
            <Dato titulo="Teléfono" valor={p.telefono} />
            <Dato titulo="Correo" valor={p.correo} />
            <Dato titulo="Dirección" valor={p.direccion} />
          </dl>
        </div>
      </section>

      <section className="panel">
        <div className="pestanas" role="tablist">
          <Pestana id="historial" actual={pestana} onClick={setPestana} texto="Historial" />
          <Pestana id="citas" actual={pestana} onClick={setPestana} texto="Citas" />
          <Pestana id="recetas" actual={pestana} onClick={setPestana} texto="Recetas" />
        </div>

        {pestana === 'historial' && (
          <>
            <div className="filtros">
              <button className="btn" onClick={() => setFormHistorial('nueva')}>
                Agregar atención
              </button>
            </div>
            <Aviso>{historial.error}</Aviso>
            <Cargando
              activo={historial.cargando && !historial.datos}
              vacio={historial.datos?.length === 0}
              mensajeVacio="Este paciente aún no tiene atenciones registradas."
            />
            {(historial.datos ?? []).map((h) => (
              <Atencion key={h.id} atencion={h} onEditar={() => setFormHistorial(h)} />
            ))}
          </>
        )}

        {pestana === 'citas' && (
          <>
            <div className="filtros">
              <Link className="btn" to={`/citas?nueva=1&pacienteId=${id}`}>
                Nueva cita
              </Link>
            </div>
            <Aviso>{citas.error}</Aviso>
            <Cargando
              activo={citas.cargando && !citas.datos}
              vacio={citas.datos?.length === 0}
              mensajeVacio="Este paciente no tiene citas."
            />
            {citas.datos?.length > 0 && (
              <div className="tabla-marco">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Médico</th>
                      <th>Servicio</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citas.datos.map((c) => (
                      <tr key={c.id}>
                        <td>{formatoFechaHora(c.fechaHora)}</td>
                        <td>{c.medicoNombre}</td>
                        <td>
                          {c.servicioNombre}
                          <span className="detalle">{formatoDinero(c.servicioPrecio)}</span>
                        </td>
                        <td>
                          <EstadoCita estado={c.estado} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {pestana === 'recetas' && (
          <>
            <div className="filtros">
              <Link className="btn" to={`/recetas/nueva?pacienteId=${id}`}>
                Nueva receta
              </Link>
            </div>
            <Aviso>{recetas.error}</Aviso>
            <Cargando
              activo={recetas.cargando && !recetas.datos}
              vacio={recetas.datos?.length === 0}
              mensajeVacio="Este paciente no tiene recetas."
            />
            {recetas.datos?.length > 0 && (
              <div className="tabla-marco">
                <table>
                  <thead>
                    <tr>
                      <th>Número</th>
                      <th>Fecha</th>
                      <th>Médico</th>
                      <th>Medicamentos</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {recetas.datos.map((r) => (
                      <tr key={r.id}>
                        <td>{r.numero}</td>
                        <td>{formatoFechaHora(r.fecha)}</td>
                        <td>{r.medicoNombre}</td>
                        <td>{r.detalles.map((d) => d.medicamento).join(', ')}</td>
                        <td>
                          <div className="celda-acciones">
                            <Link className="btn btn-chico" to={`/recetas/${r.id}`}>
                              Ver e imprimir
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>

      {editando && (
        <PacienteForm
          paciente={p}
          onCerrar={() => setEditando(false)}
          onGuardado={() => {
            setEditando(false);
            paciente.recargar();
          }}
        />
      )}

      {formHistorial && (
        <Modal
          titulo={formHistorial === 'nueva' ? 'Agregar atención' : 'Editar atención'}
          onCerrar={() => setFormHistorial(null)}
        >
          <HistorialForm
            pacienteId={p.id}
            entrada={formHistorial === 'nueva' ? undefined : formHistorial}
            onCancelar={() => setFormHistorial(null)}
            onGuardado={historialGuardado}
          />
        </Modal>
      )}
    </>
  );
}

function Dato({ titulo, valor }) {
  return (
    <div>
      <dt>{titulo}</dt>
      <dd>{valor || '—'}</dd>
    </div>
  );
}

function Pestana({ id, actual, onClick, texto }) {
  const activa = id === actual;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={activa}
      className={activa ? 'pestana pestana-activa' : 'pestana'}
      onClick={() => onClick(id)}
    >
      {texto}
    </button>
  );
}

function Atencion({ atencion: h, onEditar }) {
  const signos = [
    h.presionArterial && `PA ${h.presionArterial}`,
    h.temperatura != null && `${h.temperatura} °C`,
    h.pesoKg != null && `${h.pesoKg} kg`,
    h.tallaCm != null && `${h.tallaCm} cm`,
  ].filter(Boolean);

  return (
    <article className="atencion">
      <div className="atencion-cabecera">
        <div>
          <strong>{formatoFechaHora(h.fecha)}</strong>
          <span className="detalle">
            {h.medicoNombre} · {h.medicoEspecialidad}
          </span>
        </div>
        <div className="acciones">
          <button className="btn btn-chico" onClick={onEditar}>
            Editar
          </button>
          <Link className="btn btn-chico" to={`/recetas/nueva?historialId=${h.id}`}>
            Crear receta
          </Link>
        </div>
      </div>
      <p>
        <span className="etiqueta">Motivo: </span>
        {h.motivoConsulta}
      </p>
      <p>
        <span className="etiqueta">Diagnóstico: </span>
        {h.diagnostico}
      </p>
      {h.tratamiento && (
        <p>
          <span className="etiqueta">Tratamiento: </span>
          {h.tratamiento}
        </p>
      )}
      {h.observaciones && (
        <p>
          <span className="etiqueta">Observaciones: </span>
          {h.observaciones}
        </p>
      )}
      {signos.length > 0 && <p className="signos">{signos.join(' · ')}</p>}
    </article>
  );
}
