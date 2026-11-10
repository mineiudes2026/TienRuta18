/* =========================================================
   admin.js — Módulo administrador
   ========================================================= */

const $ = id => document.getElementById(id);

// ---------- RF-08: acceso con contraseña ----------
function mostrarPanel() {
  $('login').hidden = true;
  $('panel').hidden = false;
  renderTodo();
}

$('form-login').onsubmit = e => {
  e.preventDefault();
  if (!validarFormulario(e.target)) return;
  if ($('usuario').value.trim() === ADMIN_USER && $('clave').value === ADMIN_PASSWORD) {
    sessionStorage.setItem('ruta18_admin', '1');
    mostrarPanel();
    aviso('Bienvenido al panel de administración.', 'exito', 'Sesión iniciada');
  } else {
    $('clave').value = '';
    $('form-login').classList.remove('sacudir'); void $('form-login').offsetWidth;
    $('form-login').classList.add('sacudir');
    marcarInvalido($('clave'), 'Usuario o contraseña incorrectos.');
  }
};

// Salir: cierra la sesión y regresa a la página principal
$('salir').onclick = async () => {
  const ok = await confirmar({ titulo: '¿Cerrar sesión?', mensaje: 'Volverás a la página principal de Ruta 18.', textoOk: 'Sí, salir' });
  if (!ok) return;
  sessionStorage.removeItem('ruta18_admin');
  location.href = 'index.html';
};

// Navegación entre secciones
document.querySelectorAll('.menu [data-sec]').forEach(b => b.onclick = () => {
  document.querySelectorAll('.menu [data-sec]').forEach(x => x.classList.toggle('activo', x === b));
  document.querySelectorAll('.seccion').forEach(s => s.hidden = s.id !== 'sec-' + b.dataset.sec);
});

function renderTodo() { renderMesas(); renderHorarios(); renderFiltroMesas(); renderReservas(); renderPlatos(); }

// Si el cliente reserva en otra pestaña, el panel se actualiza solo
function alCambiarDatos(nombre) {
  if ($('panel').hidden) return;
  if (nombre === 'reservas') { renderReservas(); aviso('Llegó una reserva nueva o se actualizó una existente.', 'info', 'Reservas'); }
  else renderTodo();
}

// ---------- Mesas: RF-09, RF-10, RF-13 ----------
function renderMesas() {
  $('lista-mesas-admin').innerHTML = db.mesas.map(m => `
    <li class="item">
      ${m.foto_url ? `<img class="thumb" src="${esc(m.foto_url)}" alt="">` : `<div class="thumb mesa-thumb">${iconoMesa(m.capacidad, m.zona)}</div>`}
      <div class="info">
        <strong>${esc(m.nombre)}</strong>
        <span class="muted">${m.zona === 'terraza' ? 'Terraza' : 'Salón'} · ${m.capacidad} personas</span>
      </div>
      <span class="tag ${m.activa ? 'verde' : 'gris'}">${m.activa ? 'Activa' : 'Inactiva'}</span>
      <div class="acciones">
        <button class="mini" onclick="toggleMesa(${m.id})">${m.activa ? 'Desactivar' : 'Activar'}</button>
        <button class="mini" onclick="editarMesa(${m.id})">Editar</button>
        <button class="mini rojo" onclick="borrarMesa(${m.id})">Borrar</button>
      </div>
    </li>`).join('') || '<li class="item muted">No hay mesas registradas.</li>';
}

function abrirFormMesa(m = {}) {
  $('form-mesa').hidden = false;
  $('mesa-id').value = m.id || '';
  $('mesa-nombre').value = m.nombre || '';
  $('mesa-zona').value = m.zona || 'salon';
  $('mesa-capacidad').value = m.capacidad || 4;
  $('mesa-foto').value = m.foto_url || '';
  $('mesa-nombre').focus();
}

$('nueva-mesa').onclick = () => abrirFormMesa();
$('cancelar-mesa').onclick = () => $('form-mesa').hidden = true;
function editarMesa(id) { abrirFormMesa(db.mesas.find(m => m.id === id)); }

$('form-mesa').onsubmit = e => {
  e.preventDefault();
  if (!validarFormulario(e.target)) return;
  const id = Number($('mesa-id').value);
  const nombreMesa = $('mesa-nombre').value.trim();
  if (db.mesas.some(m => m.id !== id && m.nombre.toLowerCase() === nombreMesa.toLowerCase()))
    return marcarInvalido($('mesa-nombre'), `Ya existe una mesa llamada "${nombreMesa}".`);
  const datos = {
    nombre: nombreMesa,
    zona: $('mesa-zona').value,
    capacidad: Number($('mesa-capacidad').value),
    foto_url: $('mesa-foto').value.trim()
  };
  if (id) Object.assign(db.mesas.find(m => m.id === id), datos);
  else db.mesas.push({ id: db.nuevoId('mesas'), ...datos, activa: true, creado_en: new Date().toISOString() });
  db.guardar('mesas');
  $('form-mesa').hidden = true;
  renderMesas(); renderFiltroMesas();
  aviso(`${datos.nombre} se ${id ? 'actualizó' : 'registró'} correctamente.`, 'exito', 'Mesa guardada');
};

function toggleMesa(id) {
  const m = db.mesas.find(x => x.id === id);
  m.activa = !m.activa;
  db.guardar('mesas');
  renderMesas();
}

async function borrarMesa(id) {
  const m = db.mesas.find(x => x.id === id);
  const reservas = db.reservas.filter(r => r.mesa_id === id && r.estado === 'confirmada').length;
  const ok = await confirmar({
    titulo: `¿Borrar ${m.nombre}?`,
    mensaje: reservas ? `Tiene ${reservas} reserva(s) confirmada(s). Esta acción no se puede deshacer.` : 'Esta acción no se puede deshacer.',
    textoOk: 'Sí, borrar', peligro: true
  });
  if (!ok) return;
  db.mesas = db.mesas.filter(x => x.id !== id);
  db.guardar('mesas');
  renderMesas(); renderFiltroMesas();
  aviso(`${m.nombre} fue eliminada.`, 'exito');
}

// ---------- Horarios: RF-11 ----------
function renderHorarios() {
  $('lista-horarios').innerHTML = db.horarios.map(h => `
    <li class="item horario" data-id="${h.id}">
      <label class="check-campo dia"><input type="checkbox" class="h-activo" ${h.activo ? 'checked' : ''}> ${h.dia_semana}</label>
      <label class="h-campo"><span>Abre</span><input type="time" class="h-inicio" value="${h.hora_inicio}"></label>
      <label class="h-campo"><span>Cierra</span><input type="time" class="h-fin" value="${h.hora_fin}"></label>
      <label class="h-campo"><span>Reserva (min)</span><input type="number" class="h-dur" min="15" step="15" value="${h.duracion_slot}"></label>
    </li>`).join('');
}

$('guardar-horarios').onclick = () => {
  // Validar que cada día activo cierre después de abrir
  for (const li of document.querySelectorAll('.horario')) {
    const ini = li.querySelector('.h-inicio'), fin = li.querySelector('.h-fin'), dur = li.querySelector('.h-dur');
    const dia = db.horarios.find(x => x.id === Number(li.dataset.id)).dia_semana;
    if (!li.querySelector('.h-activo').checked) continue;
    if (!ini.value || !fin.value) return marcarInvalido(ini.value ? fin : ini, `Completa el horario del ${dia}.`);
    if (aMinutos(fin.value) <= aMinutos(ini.value)) return marcarInvalido(fin, `El ${dia} la hora de cierre debe ser después de la apertura.`);
    if (!(Number(dur.value) >= 15)) return marcarInvalido(dur, `La duración de la reserva del ${dia} debe ser de al menos 15 minutos.`);
  }
  document.querySelectorAll('.horario').forEach(li => {
    const h = db.horarios.find(x => x.id === Number(li.dataset.id));
    h.activo = li.querySelector('.h-activo').checked;
    h.hora_inicio = li.querySelector('.h-inicio').value;
    h.hora_fin = li.querySelector('.h-fin').value;
    h.duracion_slot = Number(li.querySelector('.h-dur').value);
  });
  db.guardar('horarios');
  aviso('Los horarios de atención se actualizaron.', 'exito', 'Horarios guardados');
};

// ---------- Reservas: RF-12 ----------
function renderFiltroMesas() {
  const actual = $('filtro-mesa').value;
  $('filtro-mesa').innerHTML = '<option value="">Todas</option>' +
    db.mesas.map(m => `<option value="${m.id}">${esc(m.nombre)}</option>`).join('');
  $('filtro-mesa').value = actual;
}

function renderReservas() {
  const fecha = $('filtro-fecha').value;
  const mesa = Number($('filtro-mesa').value);
  const lista = db.reservas
    .filter(r => (!fecha || r.fecha === fecha) && (!mesa || r.mesa_id === mesa))
    .sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio));

  $('lista-reservas').innerHTML = lista.map(r => {
    const m = db.mesas.find(x => x.id === r.mesa_id);
    const color = { confirmada: 'verde', cancelada: 'rojo', completada: 'gris' }[r.estado];
    return `
      <li class="item">
        <div class="info">
          <strong>${esc(r.cliente_nombre)}</strong>
          <span class="muted">${m ? esc(m.nombre) : 'Mesa eliminada'} · ${r.fecha} · ${r.hora_inicio}–${r.hora_fin} · ${r.num_personas} pers.${r.cliente_contacto ? ' · ' + esc(r.cliente_contacto) : ''}</span>
        </div>
        <span class="tag ${color}">${r.estado}</span>
        <select class="mini" onchange="cambiarEstado(${r.id}, this.value)">
          ${['confirmada', 'completada', 'cancelada'].map(e => `<option ${e === r.estado ? 'selected' : ''}>${e}</option>`).join('')}
        </select>
      </li>`;
  }).join('') || '<li class="item muted">No hay reservas para este filtro.</li>';
}

function cambiarEstado(id, valor) {
  db.reservas.find(r => r.id === id).estado = valor;
  db.guardar('reservas');
  renderReservas();
}

$('filtro-fecha').onchange = renderReservas;
$('filtro-mesa').onchange = renderReservas;
$('limpiar-filtros').onclick = () => { $('filtro-fecha').value = ''; $('filtro-mesa').value = ''; renderReservas(); };

// ---------- Carta: RF-14 ----------
const CATEGORIAS = { hamburguesas: 'Hamburguesas', sushi: 'Sushi', platos: 'Platos a la carta', bebidas: 'Bebidas' };

function renderPlatos() {
  $('lista-platos').innerHTML = db.platos.map(p => `
    <li class="item">
      ${p.imagen ? `<img class="thumb" src="${esc(p.imagen)}" alt="">` : '<div class="thumb sin-imagen"><img src="img/logo.png" alt=""></div>'}
      <div class="info">
        <strong>${esc(p.nombre)}</strong>
        <span class="muted">${CATEGORIAS[p.categoria]} · ${formatoPrecio(p.precio)}</span>
      </div>
      ${p.destacado ? '<span class="tag dorado">★ Destacado</span>' : ''}
      <span class="tag ${p.disponible ? 'verde' : 'gris'}">${p.disponible ? 'Visible' : 'Oculto'}</span>
      <div class="acciones">
        <button class="mini" onclick="togglePlato(${p.id})">${p.disponible ? 'Ocultar' : 'Mostrar'}</button>
        <button class="mini" onclick="editarPlato(${p.id})">Editar</button>
        <button class="mini rojo" onclick="borrarPlato(${p.id})">Eliminar</button>
      </div>
    </li>`).join('') || '<li class="item muted">No hay platos.</li>';
}

function abrirFormPlato(p = {}) {
  $('form-plato').hidden = false;
  $('plato-id').value = p.id || '';
  $('plato-nombre').value = p.nombre || '';
  $('plato-categoria').value = p.categoria || 'hamburguesas';
  $('plato-precio').value = p.precio ?? '';
  $('plato-descripcion').value = p.descripcion || '';
  $('plato-archivo').value = '';
  mostrarFoto(p.imagen || '');
  $('plato-disponible').checked = p.disponible ?? true;
  $('plato-destacado').checked = !!p.destacado;
  $('plato-nombre').focus();
}

// Foto del producto: se reduce a 500 px y se guarda como texto (data URL) en localStorage
function mostrarFoto(src) {
  $('plato-imagen').value = src;
  $('plato-preview').src = src;
  $('plato-preview').hidden = !src;
  $('quitar-foto').hidden = !src;
}

function reducirImagen(archivo, max = 500) {
  return new Promise((ok, falla) => {
    const lector = new FileReader();
    lector.onerror = falla;
    lector.onload = () => {
      const img = new Image();
      img.onerror = falla;
      img.onload = () => {
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        ok(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

$('plato-archivo').onchange = async e => {
  const archivo = e.target.files[0];
  if (!archivo) return;
  try { mostrarFoto(await reducirImagen(archivo)); }
  catch { aviso('No se pudo leer la imagen. Prueba con otro archivo.', 'error'); }
};
$('quitar-foto').onclick = () => { $('plato-archivo').value = ''; mostrarFoto(''); };

$('nuevo-plato').onclick = () => abrirFormPlato();
$('cancelar-plato').onclick = () => $('form-plato').hidden = true;
function editarPlato(id) { abrirFormPlato(db.platos.find(p => p.id === id)); }

$('form-plato').onsubmit = e => {
  e.preventDefault();
  if (!validarFormulario(e.target)) return;
  const id = Number($('plato-id').value);
  const datos = {
    nombre: $('plato-nombre').value.trim(),
    categoria: $('plato-categoria').value,
    precio: Number($('plato-precio').value),
    descripcion: $('plato-descripcion').value.trim(),
    imagen: $('plato-imagen').value.trim(),
    disponible: $('plato-disponible').checked,
    destacado: $('plato-destacado').checked
  };
  const respaldo = JSON.stringify(db.platos);
  if (id) Object.assign(db.platos.find(p => p.id === id), datos);
  else db.platos.push({ id: db.nuevoId('platos'), ...datos });
  if (!db.guardar('platos')) { db.platos = JSON.parse(respaldo); return; } // no se pudo guardar
  $('form-plato').hidden = true;
  renderPlatos();
  aviso(`"${datos.nombre}" se ${id ? 'actualizó' : 'agregó a la carta'}.`, 'exito', 'Plato guardado');
};

function togglePlato(id) {
  const p = db.platos.find(x => x.id === id);
  p.disponible = !p.disponible;
  db.guardar('platos');
  renderPlatos();
}

async function borrarPlato(id) {
  const p = db.platos.find(x => x.id === id);
  const ok = await confirmar({
    titulo: `¿Eliminar "${p.nombre}"?`,
    mensaje: 'Se quitará de la carta. Si solo quieres esconderlo, usa "Ocultar".',
    textoOk: 'Sí, eliminar', peligro: true
  });
  if (!ok) return;
  db.platos = db.platos.filter(x => x.id !== id);
  db.guardar('platos');
  renderPlatos();
  aviso(`"${p.nombre}" fue eliminado de la carta.`, 'exito');
}

// ---------- Inicio ----------
if (sessionStorage.getItem('ruta18_admin') === '1') mostrarPanel();
