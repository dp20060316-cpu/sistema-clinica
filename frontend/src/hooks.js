import { useEffect, useState } from 'react';
import { api } from './api.js';

// Carga datos de una ruta de la API. Se vuelve a ejecutar si cambia la ruta o al llamar recargar().
export function useDatos(ruta) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true; // evita que una respuesta antigua pise a una más nueva
    setCargando(true);
    api
      .get(ruta)
      .then((respuesta) => {
        if (vigente) {
          setDatos(respuesta);
          setError('');
        }
      })
      .catch((e) => {
        if (vigente) setError(e.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [ruta, version]);

  return { datos, error, cargando, recargar: () => setVersion((v) => v + 1) };
}

// Estado de un formulario: cada input usa name y onChange={cambiar}.
export function useFormulario(inicial) {
  const [form, setForm] = useState(inicial);

  function cambiar(e) {
    const { name, type, value, checked } = e.target;
    setForm((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value }));
  }

  return [form, cambiar, setForm];
}
