// Datos que salen en el encabezado de la receta impresa. Cámbialos a tu gusto.
export const CLINICA = {
  nombre: 'Clínica Salud Integral',
  direccion: 'Av. Principal 100',
  telefono: '900 000 000',
};

export const MONEDA = '$';

const OPCIONES_FECHA = { day: '2-digit', month: 'short', year: 'numeric' };
const OPCIONES_HORA = { hour: '2-digit', minute: '2-digit' };

// Una fecha sin hora ("1988-04-12") se leería como UTC y podría mostrar el día anterior.
function aFecha(valor) {
  return new Date(valor.length === 10 ? `${valor}T00:00:00` : valor);
}

export function formatoFecha(valor) {
  return valor ? aFecha(valor).toLocaleDateString('es', OPCIONES_FECHA) : '—';
}

export function formatoHora(valor) {
  return valor ? aFecha(valor).toLocaleTimeString('es', OPCIONES_HORA) : '—';
}

export function formatoFechaHora(valor) {
  return valor ? `${formatoFecha(valor)}, ${formatoHora(valor)}` : '—';
}

export function formatoDinero(valor) {
  return `${MONEDA} ${Number(valor).toFixed(2)}`;
}

// Fecha local de hoy en formato AAAA-MM-DD (toISOString usaría UTC).
export function hoyISO() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

export const SEXOS = { F: 'Femenino', M: 'Masculino', O: 'Otro' };

export const ESTADOS_CITA = {
  PROGRAMADA: 'Programada',
  ATENDIDA: 'Atendida',
  CANCELADA: 'Cancelada',
};
