import { useState } from 'react';
import { api } from '../api.js';
import { useDatos, useFormulario } from '../hooks.js';
import { Aviso, Campo, Cargando, Modal } from '../components/ui.jsx';

const VACIO = {
  colegiatura: '',
  nombres: '',
  apellidos: '',
  especialidad: '',
  telefono: '',
  correo: '',
  activo: true,
};

export default function Medicos() {
  const { datos, error, cargando, recargar } = useDatos('/medicos');
  // null: cerrado, 'nuevo': crear, objeto: editar
  const [seleccion, setSeleccion] = useState(null);
  const [errorAccion, setErrorAccion] = useState('');
  const medicos = datos ?? [];

  async function eliminar(medico) {
    if (!window.confirm(`¿Eliminar a ${medico.nombreCompleto}?`)) return;
    setErrorAccion('');
    try {
      await api.del(`/medicos/${medico.id}`);
      recargar();
    } catch (e) {
      setErrorAccion(`${e.message} Si ya tiene atenciones, márcalo como inactivo.`);
    }
  }

  return (
    <>
      <div className="cabecera">
        <h1>Médicos</h1>
        <button className="btn btn-primario" onClick={() => setSeleccion('nuevo')}>
          Nuevo médico
        </button>
      </div>

      <Aviso>{error || errorAccion}</Aviso>

      <section className="panel">
        <Cargando activo={cargando && !datos} vacio={!cargando && medicos.length === 0} mensajeVacio="Todavía no hay médicos." />
        {medicos.length > 0 && (
          <div className="tabla-marco">
            <table>
              <thead>
                <tr>
                  <th>Médico</th>
                  <th>Especialidad</th>
                  <th>Colegiatura</th>
                  <th>Contacto</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {medicos.map((m) => (
                  <tr key={m.id}>
                    <td>
                      {m.apellidos}, {m.nombres}
                    </td>
                    <td>{m.especialidad}</td>
                    <td>{m.colegiatura}</td>
                    <td>
                      {m.telefono || '—'}
                      {m.correo && <span className="detalle">{m.correo}</span>}
                    </td>
                    <td>
                      <span className={m.activo ? 'pill pill-activo' : 'pill pill-inactivo'}>
                        {m.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="celda-acciones">
                        <button className="btn btn-chico" onClick={() => setSeleccion(m)}>
                          Editar
                        </button>
                        <button className="btn btn-chico btn-peligro" onClick={() => eliminar(m)}>
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

      {seleccion && (
        <MedicoForm
          medico={seleccion === 'nuevo' ? null : seleccion}
          onCerrar={() => setSeleccion(null)}
          onGuardado={() => {
            setSeleccion(null);
            recargar();
          }}
        />
      )}
    </>
  );
}

function MedicoForm({ medico, onCerrar, onGuardado }) {
  const inicial = medico
    ? Object.fromEntries(Object.keys(VACIO).map((campo) => [campo, medico[campo] ?? '']))
    : VACIO;
  const [form, cambiar] = useFormulario(inicial);
  const [error, setError] = useState('');

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      if (medico) await api.put(`/medicos/${medico.id}`, form);
      else await api.post('/medicos', form);
      onGuardado();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal titulo={medico ? 'Editar médico' : 'Nuevo médico'} onCerrar={onCerrar}>
      <Aviso>{error}</Aviso>
      <form className="formulario" onSubmit={guardar}>
        <Campo etiqueta="Nombres *">
          <input name="nombres" value={form.nombres} onChange={cambiar} maxLength={80} required />
        </Campo>
        <Campo etiqueta="Apellidos *">
          <input name="apellidos" value={form.apellidos} onChange={cambiar} maxLength={80} required />
        </Campo>
        <Campo etiqueta="N.° de colegiatura *">
          <input name="colegiatura" value={form.colegiatura} onChange={cambiar} maxLength={20} required />
        </Campo>
        <Campo etiqueta="Especialidad *">
          <input name="especialidad" value={form.especialidad} onChange={cambiar} maxLength={80} required />
        </Campo>
        <Campo etiqueta="Teléfono">
          <input name="telefono" value={form.telefono} onChange={cambiar} maxLength={20} />
        </Campo>
        <Campo etiqueta="Correo">
          <input type="email" name="correo" value={form.correo} onChange={cambiar} maxLength={120} />
        </Campo>
        <label className="campo-check campo-ancho">
          <input type="checkbox" name="activo" checked={form.activo} onChange={cambiar} />
          Activo (puede recibir citas y emitir recetas)
        </label>
        <div className="formulario-pie">
          <button type="button" className="btn" onClick={onCerrar}>
            Cancelar
          </button>
          <button className="btn btn-primario">Guardar</button>
        </div>
      </form>
    </Modal>
  );
}
