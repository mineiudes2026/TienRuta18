/* =========================================================
   data.js — Datos del sistema en listas (reemplaza a Supabase)
   Las listas se guardan en localStorage para que el cliente
   y el administrador compartan la misma información.
   ========================================================= */

// Usuario de prueba del panel (RF-08)
const ADMIN_USER = 'admin123';
const ADMIN_PASSWORD = 'admin2026';

// ---- Datos iniciales ----
const MESAS_INICIALES = [
  { id: 1, nombre: 'Mesa 1', zona: 'salon',   capacidad: 2, activa: true,  foto_url: '', creado_en: '2026-11-01T10:00:00' },
  { id: 2, nombre: 'Mesa 2', zona: 'salon',   capacidad: 4, activa: true,  foto_url: '', creado_en: '2026-11-01T10:00:00' },
  { id: 3, nombre: 'Mesa 3', zona: 'salon',   capacidad: 6, activa: true,  foto_url: '', creado_en: '2026-11-01T10:00:00' },
  { id: 4, nombre: 'Mesa 4', zona: 'terraza', capacidad: 4, activa: true,  foto_url: '', creado_en: '2026-11-01T10:00:00' },
  { id: 5, nombre: 'Mesa 5', zona: 'terraza', capacidad: 8, activa: true,  foto_url: '', creado_en: '2026-11-01T10:00:00' },
  { id: 6, nombre: 'Mesa 6', zona: 'terraza', capacidad: 2, activa: false, foto_url: '', creado_en: '2026-11-01T10:00:00' }
];

const HORARIOS_INICIALES = [
  { id: 1, dia_semana: 'lunes',     hora_inicio: '12:00', hora_fin: '22:00', duracion_slot: 90, activo: false },
  { id: 2, dia_semana: 'martes',    hora_inicio: '12:00', hora_fin: '22:00', duracion_slot: 90, activo: true },
  { id: 3, dia_semana: 'miércoles', hora_inicio: '12:00', hora_fin: '22:00', duracion_slot: 90, activo: true },
  { id: 4, dia_semana: 'jueves',    hora_inicio: '12:00', hora_fin: '22:00', duracion_slot: 90, activo: true },
  { id: 5, dia_semana: 'viernes',   hora_inicio: '12:00', hora_fin: '23:00', duracion_slot: 90, activo: true },
  { id: 6, dia_semana: 'sábado',    hora_inicio: '12:00', hora_fin: '23:00', duracion_slot: 90, activo: true },
  { id: 7, dia_semana: 'domingo',   hora_inicio: '12:00', hora_fin: '21:00', duracion_slot: 90, activo: true }
];

const RESERVAS_INICIALES = [];

const PLATOS_INICIALES = [
  // Fotos tomadas de la ficha de Google de Ruta 18 And Chips (carpeta img/)
  { id: 1,  nombre: 'Hamburguesa Clásica',      categoria: 'hamburguesas', descripcion: '160 g de carne, vegetales, queso, jamón y chorizo español en salsa BBQ, con papa francesa.', precio: 22000, disponible: true, imagen: 'img/hamb-clasica.jpg' },
  { id: 2,  nombre: 'Hamburguesa Especial',     categoria: 'hamburguesas', descripcion: 'Carne, jamón, queso, chorizo, trozos de carne y pollo en salsa blanca, con papa francesa.', precio: 28000, disponible: true, destacado: true, imagen: 'img/hamb-especial.jpg' },
  { id: 3,  nombre: 'Hamburguesa Filete Miñón', categoria: 'hamburguesas', descripcion: 'Carne, lomo de res, champiñones, queso, tocineta y salsa mignon, con papa francesa.',     precio: 30000, disponible: true, destacado: true, imagen: 'img/hamb-filete-minon.jpg' },
  { id: 4,  nombre: 'Hamburguesa a lo Pobre',   categoria: 'hamburguesas', descripcion: 'Carne, queso, jamón, sofrito criollo, huevo y arepa, con papa francesa.',                 precio: 28000, disponible: true, imagen: 'img/hamb-a-lo-pobre.jpg' },
  { id: 5,  nombre: 'Mini hamburguesas',        categoria: 'hamburguesas', descripcion: 'Tres mini hamburguesas con salsas de la casa.',                                          precio: 26000, disponible: true, destacado: true, imagen: 'img/hamb-mini.jpg' },
  { id: 6,  nombre: 'Roll California',          categoria: 'sushi',        descripcion: 'Cangrejo, aguacate y pepino con ajonjolí (10 piezas).',                                  precio: 32000, disponible: true, destacado: true, imagen: 'img/sushi-california.jpg' },
  { id: 7,  nombre: 'Roll de la casa',          categoria: 'sushi',        descripcion: 'Roll especial de salmón y queso crema.',                                                 precio: 36000, disponible: true, imagen: 'img/sushi-tempura.jpg' },
  { id: 8,  nombre: 'Pechuga en salsa',         categoria: 'platos',       descripcion: 'Pechuga en salsa cremosa con ensalada fresca.',                                          precio: 34000, disponible: true, imagen: 'img/plato-pechuga.jpg' },
  { id: 9,  nombre: 'Pasta con mariscos',       categoria: 'platos',       descripcion: 'Pasta salteada con mariscos y vegetales.',                                               precio: 42000, disponible: true, destacado: true, imagen: 'img/plato-pasta-mariscos.jpg' },
  { id: 10, nombre: 'Lomo de res',              categoria: 'platos',       descripcion: 'Lomo a la parrilla con ensalada y acompañante.',                                         precio: 45000, disponible: true, destacado: true, imagen: 'img/plato-lomo.jpg' },
  { id: 11, nombre: 'Salmón a la plancha',      categoria: 'platos',       descripcion: 'Filete de salmón con ensalada verde.',                                                   precio: 48000, disponible: true, imagen: 'img/plato-salmon.jpg' },
  { id: 12, nombre: 'Jugo de fresa',            categoria: 'bebidas',      descripcion: 'Jugo natural de fresa en agua o leche.',                                                 precio: 9000,  disponible: true, imagen: 'img/bebida-fresa.jpg' },
  { id: 13, nombre: 'Jugo de mango',            categoria: 'bebidas',      descripcion: 'Jugo natural de mango.',                                                                 precio: 9000,  disponible: true, imagen: 'img/bebida-mango.jpg' },
  { id: 14, nombre: 'Limonadas de la casa',     categoria: 'bebidas',      descripcion: 'Limonada de cereza o de hierbabuena.',                                                   precio: 10000, disponible: false, imagen: 'img/bebida-limonadas.jpg' }
];

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// ---- Acceso a las listas ----
function cargar(nombre, inicial) {
  try {
    const guardado = localStorage.getItem('ruta18v2_' + nombre);
    if (guardado) return JSON.parse(guardado);
  } catch (e) { /* sin localStorage: se usan los datos iniciales */ }
  return JSON.parse(JSON.stringify(inicial));
}

function guardar(nombre, lista) {
  try {
    localStorage.setItem('ruta18v2_' + nombre, JSON.stringify(lista));
    return true;
  } catch (e) {
    if (typeof aviso === 'function') aviso('El navegador no tiene espacio. Usa una imagen más pequeña.', 'error', 'No se pudo guardar');
    return false;
  }
}

const db = {
  mesas:    cargar('mesas', MESAS_INICIALES),
  horarios: cargar('horarios', HORARIOS_INICIALES),
  reservas: cargar('reservas', RESERVAS_INICIALES),
  platos:   cargar('platos', PLATOS_INICIALES),
  guardar(nombre) { return guardar(nombre, this[nombre]); },
  nuevoId(nombre) { return this[nombre].reduce((m, x) => Math.max(m, x.id), 0) + 1; }
};

// ---- Utilidades compartidas ----
function aMinutos(hora) { const [h, m] = hora.split(':').map(Number); return h * 60 + m; }
function aHora(min) { return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0'); }

function diaDeFecha(fecha) { return DIAS[new Date(fecha + 'T00:00:00').getDay()]; }

function horarioDeFecha(fecha) {
  return db.horarios.find(h => h.dia_semana === diaDeFecha(fecha) && h.activo);
}

// Genera los slots de una mesa en una fecha y marca los ocupados (RF-04, RF-11)
function slotsDeMesa(mesaId, fecha) {
  const horario = horarioDeFecha(fecha);
  if (!horario) return [];
  const inicio = aMinutos(horario.hora_inicio);
  const fin = aMinutos(horario.hora_fin);
  const dur = Number(horario.duracion_slot);
  const reservas = db.reservas.filter(r => r.mesa_id === mesaId && r.fecha === fecha && r.estado !== 'cancelada');
  // Horas que ya pasaron: todo el día si la fecha es anterior a hoy, o hasta la hora actual si es hoy
  const hoy = hoyISO();
  const ahora = new Date().getHours() * 60 + new Date().getMinutes();
  const limite = fecha < hoy ? Infinity : fecha === hoy ? ahora : -1;
  const slots = [];
  for (let t = inicio; t + dur <= fin; t += dur) {
    const hi = aHora(t), hf = aHora(t + dur);
    const ocupado = reservas.some(r => aMinutos(r.hora_inicio) < t + dur && aMinutos(r.hora_fin) > t);
    slots.push({ hora_inicio: hi, hora_fin: hf, ocupado, pasado: t <= limite });
  }
  return slots;
}

// Recarga las listas cuando otra pestaña las cambia (ej. una reserva nueva mientras el admin está abierto)
window.addEventListener('storage', e => {
  if (!e.key || !e.key.startsWith('ruta18v2_')) return;
  const nombre = e.key.slice('ruta18v2_'.length);
  if (!(nombre in db)) return;
  try { db[nombre] = e.newValue ? JSON.parse(e.newValue) : cargar(nombre, []); } catch { return; }
  if (typeof alCambiarDatos === 'function') alCambiarDatos(nombre);
});

function formatoPrecio(n) { return '$' + Number(n).toLocaleString('es-CO'); }
function hoyISO() { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
