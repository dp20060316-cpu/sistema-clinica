import { NavLink, Route, Routes } from 'react-router-dom';
import { CLINICA } from './utils.js';
import Inicio from './pages/Inicio.jsx';
import Pacientes from './pages/Pacientes.jsx';
import PacienteDetalle from './pages/PacienteDetalle.jsx';
import Medicos from './pages/Medicos.jsx';
import Servicios from './pages/Servicios.jsx';
import Citas from './pages/Citas.jsx';
import AtenderCita from './pages/AtenderCita.jsx';
import Recetas from './pages/Recetas.jsx';
import NuevaReceta from './pages/NuevaReceta.jsx';
import ImprimirReceta from './pages/ImprimirReceta.jsx';

const MENU = [
  { ruta: '/', texto: 'Inicio' },
  { ruta: '/citas', texto: 'Citas' },
  { ruta: '/pacientes', texto: 'Pacientes' },
  { ruta: '/recetas', texto: 'Recetas' },
  { ruta: '/medicos', texto: 'Médicos' },
  { ruta: '/servicios', texto: 'Servicios' },
];

export default function App() {
  return (
    <div className="app">
      <aside className="lateral no-imprimir">
        <div className="marca">{CLINICA.nombre}</div>
        <nav>
          {MENU.map((item) => (
            <NavLink key={item.ruta} to={item.ruta} end={item.ruta === '/'}>
              {item.texto}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="contenido">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/pacientes/:id" element={<PacienteDetalle />} />
          <Route path="/medicos" element={<Medicos />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/citas" element={<Citas />} />
          <Route path="/citas/:id/atender" element={<AtenderCita />} />
          <Route path="/recetas" element={<Recetas />} />
          <Route path="/recetas/nueva" element={<NuevaReceta />} />
          <Route path="/recetas/:id" element={<ImprimirReceta />} />
          <Route path="*" element={<p className="vacio">Página no encontrada.</p>} />
        </Routes>
      </main>
    </div>
  );
}
