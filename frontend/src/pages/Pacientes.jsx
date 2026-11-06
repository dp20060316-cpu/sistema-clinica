import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDatos } from '../hooks.js';
import { Aviso, Cargando } from '../components/ui.jsx';
import PacienteForm from '../components/PacienteForm.jsx';

export default function Pacientes() {
  const [texto, setTexto] = useState('');
  const [creando, setCreando] = useState(false);
  const navegar = useNavigate();
  const { datos, error, cargando } = useDatos(`/pacientes?q=${encodeURIComponent(texto.trim())}`);
  const pacientes = datos ?? [];

  return (
    <>
      <div className="cabecera">
        <h1>Pacientes</h1>
        <button className="btn btn-primario" onClick={() => setCreando(true)}>
          Nuevo paciente
        </button>
      </div>

      <Aviso>{error}</Aviso>

      <section className="panel">
        <div className="filtros">
          <input
            className="buscador"
            type="search"
            placeholder="Buscar por nombre, apellido o documento"
            aria-label="Buscar paciente"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
          />
        </div>
        <Cargando
          activo={cargando && !datos}
          vacio={!cargando && pacientes.length === 0}
          mensajeVacio={texto ? 'Ningún paciente coincide con la búsqueda.' : 'Todavía no hay pacientes.'}
        />
        {pacientes.length > 0 && (
          <div className="tabla-marco">
            <table>
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Documento</th>
                  <th>Edad</th>
                  <th>Teléfono</th>
                  <th>Alergias</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link to={`/pacientes/${p.id}`}>
                        {p.apellidos}, {p.nombres}
                      </Link>
                    </td>
                    <td>{p.documento}</td>
                    <td>{p.edad} años</td>
                    <td>{p.telefono || '—'}</td>
                    <td>{p.alergias || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {creando && (
        <PacienteForm
          onCerrar={() => setCreando(false)}
          onGuardado={(paciente) => navegar(`/pacientes/${paciente.id}`)}
        />
      )}
    </>
  );
}
