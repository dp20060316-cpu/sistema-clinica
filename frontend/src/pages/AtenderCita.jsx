import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDatos } from '../hooks.js';
import { formatoFechaHora } from '../utils.js';
import { Aviso, Cargando } from '../components/ui.jsx';
import HistorialForm from '../components/HistorialForm.jsx';

// Al guardar se crea la entrada de historial y la cita pasa a "Atendida".
export default function AtenderCita() {
  const { id } = useParams();
  const navegar = useNavigate();
  const { datos: cita, error } = useDatos(`/citas/${id}`);

  if (error) return <Aviso>{error}</Aviso>;
  if (!cita) return <Cargando activo />;

  return (
    <>
      <div className="cabecera">
        <div>
          <h1>Atender cita</h1>
          <p className="subtitulo">
            <Link to={`/pacientes/${cita.pacienteId}`}>{cita.pacienteNombre}</Link> · {cita.medicoNombre} ·{' '}
            {formatoFechaHora(cita.fechaHora)}
          </p>
        </div>
      </div>

      {cita.estado !== 'PROGRAMADA' ? (
        <Aviso>Esta cita ya no se puede atender porque no está programada.</Aviso>
      ) : (
        <section className="panel">
          <div className="panel-cuerpo">
            <HistorialForm
              citaId={cita.id}
              motivoInicial={cita.motivo ?? ''}
              onCancelar={() => navegar('/citas')}
              onGuardado={(entrada, crearReceta) =>
                navegar(crearReceta ? `/recetas/nueva?historialId=${entrada.id}` : `/pacientes/${cita.pacienteId}`)
              }
            />
          </div>
        </section>
      )}
    </>
  );
}
