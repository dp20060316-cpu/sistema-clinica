import { useRef, useState } from 'react';
import { api } from '../api.js';
import { useDatos, useFormulario } from '../hooks.js';
import { Aviso, Campo } from './ui.jsx';

const vacioANull = (valor) => (valor === '' ? null : valor);

// Tres usos: atender una cita (citaId), agregar una entrada suelta (pacienteId)
// o editar una entrada existente (entrada).
// onGuardado recibe la entrada guardada y si el usuario pidió crear una receta.
export default function HistorialForm({ citaId, pacienteId, entrada, motivoInicial = '', onGuardado, onCancelar }) {
  const eligeMedico = !citaId && !entrada;
  const [form, cambiar] = useFormulario({
    medicoId: '',
    motivoConsulta: entrada?.motivoConsulta ?? motivoInicial,
    diagnostico: entrada?.diagnostico ?? '',
    tratamiento: entrada?.tratamiento ?? '',
    observaciones: entrada?.observaciones ?? '',
    presionArterial: entrada?.presionArterial ?? '',
    temperatura: entrada?.temperatura ?? '',
    pesoKg: entrada?.pesoKg ?? '',
    tallaCm: entrada?.tallaCm ?? '',
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const crearReceta = useRef(false);

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    const cuerpo = {
      ...form,
      pacienteId: pacienteId ?? null,
      medicoId: vacioANull(form.medicoId),
      citaId: citaId ?? null,
      temperatura: vacioANull(form.temperatura),
      pesoKg: vacioANull(form.pesoKg),
      tallaCm: vacioANull(form.tallaCm),
    };
    try {
      const guardada = entrada
        ? await api.put(`/historial/${entrada.id}`, cuerpo)
        : await api.post('/historial', cuerpo);
      onGuardado(guardada, crearReceta.current);
    } catch (err) {
      setError(err.message);
      setGuardando(false);
      crearReceta.current = false;
    }
  }

  return (
    <>
      <Aviso>{error}</Aviso>
      <form className="formulario" onSubmit={guardar}>
        {eligeMedico && <SelectorMedico valor={form.medicoId} onChange={cambiar} />}
        <Campo etiqueta="Motivo de consulta *" ancho>
          <input name="motivoConsulta" value={form.motivoConsulta} onChange={cambiar} maxLength={300} required />
        </Campo>
        <Campo etiqueta="Presión arterial">
          <input name="presionArterial" value={form.presionArterial} onChange={cambiar} maxLength={10} placeholder="120/80" />
        </Campo>
        <Campo etiqueta="Temperatura (°C)">
          <input type="number" step="0.1" min="0" max="99" name="temperatura" value={form.temperatura} onChange={cambiar} />
        </Campo>
        <Campo etiqueta="Peso (kg)">
          <input type="number" step="0.01" min="0" max="999" name="pesoKg" value={form.pesoKg} onChange={cambiar} />
        </Campo>
        <Campo etiqueta="Talla (cm)">
          <input type="number" step="0.01" min="0" max="999" name="tallaCm" value={form.tallaCm} onChange={cambiar} />
        </Campo>
        <Campo etiqueta="Diagnóstico *" ancho>
          <textarea rows={3} name="diagnostico" value={form.diagnostico} onChange={cambiar} maxLength={1000} required />
        </Campo>
        <Campo etiqueta="Tratamiento" ancho>
          <textarea rows={3} name="tratamiento" value={form.tratamiento} onChange={cambiar} maxLength={1000} />
        </Campo>
        <Campo etiqueta="Observaciones" ancho>
          <textarea rows={2} name="observaciones" value={form.observaciones} onChange={cambiar} maxLength={1000} />
        </Campo>
        <div className="formulario-pie">
          <button type="button" className="btn" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn" disabled={guardando}>
            Guardar
          </button>
          {!entrada && (
            <button
              className="btn btn-primario"
              disabled={guardando}
              onClick={() => {
                crearReceta.current = true;
              }}
            >
              Guardar y crear receta
            </button>
          )}
        </div>
      </form>
    </>
  );
}

function SelectorMedico({ valor, onChange }) {
  const { datos: medicos } = useDatos('/medicos');
  return (
    <Campo etiqueta="Médico *" ancho>
      <select name="medicoId" value={valor} onChange={onChange} required>
        <option value="">Selecciona un médico</option>
        {(medicos ?? [])
          .filter((m) => m.activo)
          .map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombreCompleto} · {m.especialidad}
            </option>
          ))}
      </select>
    </Campo>
  );
}
