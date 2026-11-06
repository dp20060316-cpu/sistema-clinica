import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useDatos, useFormulario } from '../hooks.js';
import { ESTADOS_CITA, formatoDinero, formatoFechaHora, hoyISO } from '../utils.js';
import { Aviso, Campo, Cargando, EstadoCita, Modal } from '../components/ui.jsx';

export default function Citas() {
  const [parametros, setParametros] = useSearchParams();
  const [filtros, cambiarFiltro, setFiltros] = useFormulario({ fecha: '', medicoId: '', estado: 'PROGRAMADA' });
  const [editando, setEditando] = useState(null);
  const [errorAccion, setErrorAccion] = useState('');

  // Solo se envían a la API los filtros que tienen valor.
  const consulta = new URLSearchParams(Object.entries(filtros).filter(([, valor]) => valor)).toString();
  const { datos, error, cargando, recargar } = useDatos(`/citas?${consulta}`);
  const medicos = useDatos('/medicos');
  const citas = datos ?? [];

  // /citas?nueva=1&pacienteId=5 abre el formulario directamente.
  const creando = parametros.get('nueva') === '1';
  const pacienteInicial = parametros.get('pacienteId') ?? '';

  function cerrarFormulario() {
    setEditando(null);
    if (creando) setParametros({});
  }

  async function cancelar(cita) {
    if (!window.confirm(`¿Cancelar la cita de ${cita.pacienteNombre}?`)) return;
    setErrorAccion('');
    try {
      await api.patch(`/citas/${cita.id}/cancelar`);
      recargar();
    } catch (e) {
      setErrorAccion(e.message);
    }
  }

  return (
    <>
      <div className="cabecera">
        <h1>Citas</h1>
        <button className="btn btn-primario" onClick={() => setParametros({ nueva: '1' })}>
          Nueva cita
        </button>
      </div>

      <Aviso>{error || errorAccion}</Aviso>

      <section className="panel">
        <div className="filtros">
          <Campo etiqueta="Fecha">
            <input type="date" name="fecha" value={filtros.fecha} onChange={cambiarFiltro} />
          </Campo>
          <Campo etiqueta="Médico">
            <select name="medicoId" value={filtros.medicoId} onChange={cambiarFiltro}>
              <option value="">Todos</option>
              {(medicos.datos ?? []).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombreCompleto}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Estado">
            <select name="estado" value={filtros.estado} onChange={cambiarFiltro}>
              <option value="">Todos</option>
              {Object.entries(ESTADOS_CITA).map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          </Campo>
          <button className="btn" onClick={() => setFiltros((f) => ({ ...f, fecha: hoyISO() }))}>
            Hoy
          </button>
          <button className="btn" onClick={() => setFiltros({ fecha: '', medicoId: '', estado: '' })}>
            Ver todas
          </button>
        </div>

        <Cargando activo={cargando && !datos} vacio={!cargando && citas.length === 0} mensajeVacio="No hay citas con estos filtros." />
        {citas.length > 0 && (
          <div className="tabla-marco">
            <table>
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Servicio</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {citas.map((c) => (
                  <tr key={c.id}>
                    <td>{formatoFechaHora(c.fechaHora)}</td>
                    <td>
                      <Link to={`/pacientes/${c.pacienteId}`}>{c.pacienteNombre}</Link>
                      {c.motivo && <span className="detalle">{c.motivo}</span>}
                    </td>
                    <td>
                      {c.medicoNombre}
                      <span className="detalle">{c.medicoEspecialidad}</span>
                    </td>
                    <td>
                      {c.servicioNombre}
                      <span className="detalle">{formatoDinero(c.servicioPrecio)}</span>
                    </td>
                    <td>
                      <EstadoCita estado={c.estado} />
                    </td>
                    <td>
                      {c.estado === 'PROGRAMADA' && (
                        <div className="celda-acciones">
                          <Link className="btn btn-chico" to={`/citas/${c.id}/atender`}>
                            Atender
                          </Link>
                          <button className="btn btn-chico" onClick={() => setEditando(c)}>
                            Editar
                          </button>
                          <button className="btn btn-chico btn-peligro" onClick={() => cancelar(c)}>
                            Cancelar
                          </button>
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

      {(creando || editando) && (
        <CitaForm
          cita={editando}
          pacienteInicial={pacienteInicial}
          onCerrar={cerrarFormulario}
          onGuardado={() => {
            cerrarFormulario();
            recargar();
          }}
        />
      )}
    </>
  );
}

function CitaForm({ cita, pacienteInicial, onCerrar, onGuardado }) {
  const pacientes = useDatos('/pacientes');
  const medicos = useDatos('/medicos');
  const servicios = useDatos('/servicios');
  const [form, cambiar] = useFormulario({
    pacienteId: cita?.pacienteId ?? pacienteInicial,
    medicoId: cita?.medicoId ?? '',
    servicioId: cita?.servicioId ?? '',
    fechaHora: cita?.fechaHora?.slice(0, 16) ?? '',
    motivo: cita?.motivo ?? '',
  });
  const [error, setError] = useState('');

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      if (cita) await api.put(`/citas/${cita.id}`, form);
      else await api.post('/citas', form);
      onGuardado();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal titulo={cita ? 'Editar cita' : 'Nueva cita'} onCerrar={onCerrar}>
      <Aviso>{error || pacientes.error || medicos.error || servicios.error}</Aviso>
      <form className="formulario" onSubmit={guardar}>
        <Campo etiqueta="Paciente *" ancho>
          <select name="pacienteId" value={form.pacienteId} onChange={cambiar} required>
            <option value="">Selecciona un paciente</option>
            {(pacientes.datos ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.apellidos}, {p.nombres} · {p.documento}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Médico *">
          <select name="medicoId" value={form.medicoId} onChange={cambiar} required>
            <option value="">Selecciona un médico</option>
            {(medicos.datos ?? [])
              .filter((m) => m.activo)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombreCompleto} · {m.especialidad}
                </option>
              ))}
          </select>
        </Campo>
        <Campo etiqueta="Servicio *">
          <select name="servicioId" value={form.servicioId} onChange={cambiar} required>
            <option value="">Selecciona un servicio</option>
            {(servicios.datos ?? [])
              .filter((s) => s.activo)
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} · {formatoDinero(s.precio)}
                </option>
              ))}
          </select>
        </Campo>
        <Campo etiqueta="Fecha y hora *" ancho>
          <input type="datetime-local" name="fechaHora" value={form.fechaHora} onChange={cambiar} required />
        </Campo>
        <Campo etiqueta="Motivo" ancho>
          <input name="motivo" value={form.motivo} onChange={cambiar} maxLength={300} />
        </Campo>
        <div className="formulario-pie">
          <button type="button" className="btn" onClick={onCerrar}>
            Volver
          </button>
          <button className="btn btn-primario">Guardar</button>
        </div>
      </form>
    </Modal>
  );
}
