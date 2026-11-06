// Cliente único para hablar con el backend.
async function pedir(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`/api${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  if (respuesta.status === 204) return null;

  const texto = await respuesta.text();
  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    // La respuesta no era JSON: normalmente el backend está apagado.
  }

  if (!respuesta.ok) {
    throw new Error(
      datos?.message || 'El servidor no respondió bien. Revisa que el backend esté en marcha.',
    );
  }
  return datos;
}

const conCuerpo = (metodo) => (ruta, cuerpo) =>
  pedir(ruta, { method: metodo, body: JSON.stringify(cuerpo) });

export const api = {
  get: (ruta) => pedir(ruta),
  post: conCuerpo('POST'),
  put: conCuerpo('PUT'),
  patch: (ruta) => pedir(ruta, { method: 'PATCH' }),
  del: (ruta) => pedir(ruta, { method: 'DELETE' }),
};
