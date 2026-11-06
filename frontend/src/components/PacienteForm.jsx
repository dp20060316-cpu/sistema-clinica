import { useState } from 'react';
import { api } from '../api.js';
import { useFormulario } from '../hooks.js';
import { hoyISO } from '../utils.js';
import { Aviso, Campo, Modal } from './ui.jsx';

const VACIO = {
  documento: '',
  nombres: '',
  apellidos: '',
  fechaNacimiento: '',
  sexo: 'F',
  telefono: '',
  correo: '',
  direccion: '',
  tipoSangre: '',
  alergias: '',
};

const TIPOS_SANGRE = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Sirve para crear (sin paciente) y para editar (con paciente).
export default function PacienteForm({ paciente, onGuardado, onCerrar }) {
  const inicial = paciente
    ? Object.fromEntries(Object.keys(VACIO).map((campo) => [campo, paciente[campo] ?? '']))
    : VACIO;
  const [form, cambiar] = useFormulario(inicial);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      const guardado = paciente
        ? await api.put(`/pacientes/${paciente.id}`, form)
        : await api.post('/pacientes', form);
      onGuardado(guardado);
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={paciente ? 'Editar paciente' : 'Nuevo paciente'} onCerrar={onCerrar}>
      <Aviso>{error}</Aviso>
      <form className="formulario" onSubmit={guardar}>
        <Campo etiqueta="Documento (DNI) *">
          <input name="documento" value={form.documento} onChange={cambiar} maxLength={20} required />
        </Campo>
        <Campo etiqueta="Fecha de nacimiento *">
          <input
            type="date"
            name="fechaNacimiento"
            value={form.fechaNacimiento}
            onChange={cambiar}
            max={hoyISO()}
            required
          />
        </Campo>
        <Campo etiqueta="Nombres *">
          <input name="nombres" value={form.nombres} onChange={cambiar} maxLength={80} required />
        </Campo>
        <Campo etiqueta="Apellidos *">
          <input name="apellidos" value={form.apellidos} onChange={cambiar} maxLength={80} required />
        </Campo>
        <Campo etiqueta="Sexo *">
          <select name="sexo" value={form.sexo} onChange={cambiar}>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
            <option value="O">Otro</option>
          </select>
        </Campo>
        <Campo etiqueta="Tipo de sangre">
          <select name="tipoSangre" value={form.tipoSangre} onChange={cambiar}>
            <option value="">Sin registrar</option>
            {TIPOS_SANGRE.map((tipo) => (
              <option key={tipo}>{tipo}</option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Teléfono">
          <input name="telefono" value={form.telefono} onChange={cambiar} maxLength={20} />
        </Campo>
        <Campo etiqueta="Correo">
          <input type="email" name="correo" value={form.correo} onChange={cambiar} maxLength={120} />
        </Campo>
        <Campo etiqueta="Dirección" ancho>
          <input name="direccion" value={form.direccion} onChange={cambiar} maxLength={200} />
        </Campo>
        <Campo etiqueta="Alergias" ancho>
          <input name="alergias" value={form.alergias} onChange={cambiar} maxLength={300} />
        </Campo>
        <div className="formulario-pie">
          <button type="button" className="btn" onClick={onCerrar}>
            Cancelar
          </button>
          <button className="btn btn-primario" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
