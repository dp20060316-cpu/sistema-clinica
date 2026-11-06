import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useDatos } from '../hooks.js';
import { formatoFechaHora } from '../utils.js';
import { Aviso, Campo } from '../components/ui.jsx';

const MEDICAMENTO_VACIO = { medicamento: '', dosis: '', frecuencia: '', duracion: '', indicaciones: '' };

export default function NuevaReceta() {
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const historialId = parametros.get('historialId');

  const pacientes = useDatos('/pacientes');
  const medicos = useDatos('/medicos');

  const [pacienteId, setPacienteId] = useState(parametros.get('pacienteId') ?? '');
  const [medicoId, setMedicoId] = useState('');
  const [indicaciones, setIndicaciones] = useState('');
  const [detalles, setDetalles] = useState([{ ...MEDICAMENTO_VACIO }]);
  const [atencion, setAtencion] = useState(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Si la receta nace de una atención, el paciente y el médico salen de ahí.
  useEffect(() => {
    if (!historialId) return;
    api
      .get(`/historial/${historialId}`)
      .then((h) => {
        setAtencion(h);
        setPacienteId(String(h.pacienteId));
        setMedicoId(String(h.medicoId));
      })
      .catch((e) => setError(e.message));
  }, [historialId]);

  const pacienteElegido = (pacientes.datos ?? []).find((p) => String(p.id) === pacienteId);

  function cambiarDetalle(indice, campo, valor) {
    setDetalles((lista) => lista.map((d, i) => (i === indice ? { ...d, [campo]: valor } : d)));
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const receta = await api.post('/recetas', {
        pacienteId,
        medicoId,
        historialId: atencion?.id ?? null,
        indicaciones,
        detalles,
      });
      navegar(`/recetas/${receta.id}`);
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  }

  return (
    <>
      <div className="cabecera">
        <div>
          <h1>Nueva receta</h1>
          {atencion && (
            <p className="subtitulo">
              Atención del {formatoFechaHora(atencion.fecha)} · {atencion.diagnostico}
            </p>
          )}
        </div>
      </div>

      <Aviso>{error || pacientes.error || medicos.error}</Aviso>

      <form onSubmit={guardar}>
        <section className="panel">
          <div className="panel-cuerpo formulario">
            <Campo etiqueta="Paciente *">
              <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)} disabled={!!atencion} required>
                <option value="">Selecciona un paciente</option>
                {(pacientes.datos ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.apellidos}, {p.nombres} · {p.documento}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo etiqueta="Médico *">
              <select value={medicoId} onChange={(e) => setMedicoId(e.target.value)} required>
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
            {pacienteElegido?.alergias && (
              <p className="alergia campo-ancho" style={{ margin: 0 }}>
                Alergias del paciente: {pacienteElegido.alergias}
              </p>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-cabecera">
            <h2>Medicamentos</h2>
            <button
              type="button"
              className="btn btn-chico"
              onClick={() => setDetalles((lista) => [...lista, { ...MEDICAMENTO_VACIO }])}
            >
              Agregar medicamento
            </button>
          </div>
          <div className="panel-cuerpo" style={{ paddingTop: 0 }}>
            {detalles.map((d, i) => (
              <div className="medicamento" key={i}>
                <Campo etiqueta="Medicamento *">
                  <input
                    value={d.medicamento}
                    onChange={(e) => cambiarDetalle(i, 'medicamento', e.target.value)}
                    maxLength={120}
                    placeholder="Paracetamol 500 mg"
                    required
                  />
                </Campo>
                <Campo etiqueta="Dosis *">
                  <input
                    value={d.dosis}
                    onChange={(e) => cambiarDetalle(i, 'dosis', e.target.value)}
                    maxLength={60}
                    placeholder="1 tableta"
                    required
                  />
                </Campo>
                <Campo etiqueta="Frecuencia *">
                  <input
                    value={d.frecuencia}
                    onChange={(e) => cambiarDetalle(i, 'frecuencia', e.target.value)}
                    maxLength={60}
                    placeholder="Cada 8 horas"
                    required
                  />
                </Campo>
                <Campo etiqueta="Duración *">
                  <input
                    value={d.duracion}
                    onChange={(e) => cambiarDetalle(i, 'duracion', e.target.value)}
                    maxLength={60}
                    placeholder="5 días"
                    required
                  />
                </Campo>
                <button
                  type="button"
                  className="btn btn-peligro"
                  disabled={detalles.length === 1}
                  onClick={() => setDetalles((lista) => lista.filter((_, j) => j !== i))}
                >
                  Quitar
                </button>
                <div className="medicamento-nota">
                  <Campo etiqueta="Nota para este medicamento">
                    <input
                      value={d.indicaciones}
                      onChange={(e) => cambiarDetalle(i, 'indicaciones', e.target.value)}
                      maxLength={200}
                    />
                  </Campo>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              <Campo etiqueta="Indicaciones generales">
                <textarea rows={3} value={indicaciones} onChange={(e) => setIndicaciones(e.target.value)} maxLength={1000} />
              </Campo>
            </div>
          </div>
        </section>

        <div className="acciones" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn" onClick={() => navegar(-1)}>
            Cancelar
          </button>
          <button className="btn btn-primario" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar y ver receta'}
          </button>
        </div>
      </form>
    </>
  );
}
