import { useState } from 'react';
import { api } from '../api.js';
import { useDatos, useFormulario } from '../hooks.js';
import { formatoDinero } from '../utils.js';
import { Aviso, Campo, Cargando, Modal } from '../components/ui.jsx';

const VACIO = { nombre: '', descripcion: '', precio: '', activo: true };

export default function Servicios() {
  const { datos, error, cargando, recargar } = useDatos('/servicios');
  // null: cerrado, 'nuevo': crear, objeto: editar
  const [seleccion, setSeleccion] = useState(null);
  const [errorAccion, setErrorAccion] = useState('');
  const servicios = datos ?? [];

  async function eliminar(servicio) {
    if (!window.confirm(`¿Eliminar el servicio ${servicio.nombre}?`)) return;
    setErrorAccion('');
    try {
      await api.del(`/servicios/${servicio.id}`);
      recargar();
    } catch (e) {
      setErrorAccion(`${e.message} Si ya tiene citas, márcalo como inactivo.`);
    }
  }

  return (
    <>
      <div className="cabecera">
        <h1>Servicios</h1>
        <button className="btn btn-primario" onClick={() => setSeleccion('nuevo')}>
          Nuevo servicio
        </button>
      </div>

      <Aviso>{error || errorAccion}</Aviso>

      <section className="panel">
        <Cargando activo={cargando && !datos} vacio={!cargando && servicios.length === 0} mensajeVacio="Todavía no hay servicios." />
        {servicios.length > 0 && (
          <div className="tabla-marco">
            <table>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Descripción</th>
                  <th className="numero">Precio</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {servicios.map((s) => (
                  <tr key={s.id}>
                    <td>{s.nombre}</td>
                    <td>{s.descripcion || '—'}</td>
                    <td className="numero">{formatoDinero(s.precio)}</td>
                    <td>
                      <span className={s.activo ? 'pill pill-activo' : 'pill pill-inactivo'}>
                        {s.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="celda-acciones">
                        <button className="btn btn-chico" onClick={() => setSeleccion(s)}>
                          Editar
                        </button>
                        <button className="btn btn-chico btn-peligro" onClick={() => eliminar(s)}>
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
        <ServicioForm
          servicio={seleccion === 'nuevo' ? null : seleccion}
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

function ServicioForm({ servicio, onCerrar, onGuardado }) {
  const [form, cambiar] = useFormulario(
    servicio
      ? {
          nombre: servicio.nombre,
          descripcion: servicio.descripcion ?? '',
          precio: servicio.precio,
          activo: servicio.activo,
        }
      : VACIO,
  );
  const [error, setError] = useState('');

  async function guardar(e) {
    e.preventDefault();
    setError('');
    try {
      if (servicio) await api.put(`/servicios/${servicio.id}`, form);
      else await api.post('/servicios', form);
      onGuardado();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal titulo={servicio ? 'Editar servicio' : 'Nuevo servicio'} onCerrar={onCerrar}>
      <Aviso>{error}</Aviso>
      <form className="formulario" onSubmit={guardar}>
        <Campo etiqueta="Nombre *">
          <input name="nombre" value={form.nombre} onChange={cambiar} maxLength={100} required />
        </Campo>
        <Campo etiqueta="Precio *">
          <input type="number" step="0.01" min="0" name="precio" value={form.precio} onChange={cambiar} required />
        </Campo>
        <Campo etiqueta="Descripción" ancho>
          <input name="descripcion" value={form.descripcion} onChange={cambiar} maxLength={300} />
        </Campo>
        <label className="campo-check campo-ancho">
          <input type="checkbox" name="activo" checked={form.activo} onChange={cambiar} />
          Activo (se puede elegir al crear citas)
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
