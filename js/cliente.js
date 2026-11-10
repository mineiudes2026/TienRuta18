/* =========================================================
   cliente.js — Módulo cliente: mesas, reserva y carta
   ========================================================= */

const $ = id => document.getElementById(id);
const fechaGeneral = $('fecha-general');
const estado = { mesa: null, fecha: null, slot: null };

// ---------- RF-01: lista de mesas ----------
function renderMesas() {
  const fecha = fechaGeneral.value;
  const mesas = db.mesas.filter(m => m.activa); // RF-13: inactivas no aparecen
  const horario = horarioDeFecha(fecha);
  let conCupo = 0;

  $('lista-mesas').innerHTML = mesas.map(m => {
    const slots = slotsDeMesa(m.id, fecha);
    const libres = slots.filter(s => !s.ocupado && !s.pasado).length;
    if (libres > 0) conCupo++;
    const disp = fecha < hoyISO() ? '<span class="tag gris">Fecha pasada</span>'
      : !horario ? '<span class="tag gris">Cerrado</span>'
      : libres > 0 ? `<span class="tag verde">${libres} horarios libres</span>`
      : '<span class="tag rojo">Sin cupo</span>';
    return `
      <li class="item mesa ${libres ? '' : 'deshabilitada'}" data-id="${m.id}">
        ${m.foto_url ? `<img src="${esc(m.foto_url)}" alt="">` : `<div class="foto">${iconoMesa(m.capacidad, m.zona)}</div>`}
        <div class="info">
          <strong>${esc(m.nombre)}</strong>
          <span class="muted">${m.zona === 'terraza' ? 'Terraza' : 'Salón'} · ${m.capacidad} personas</span>
        </div>
        ${disp}
      </li>`;
  }).join('') || '<li class="item muted">No hay mesas disponibles.</li>';

  $('resumen-mesas').textContent = fecha < hoyISO() ? 'Elige una fecha desde hoy'
    : horario ? `${mesas.length} mesas · ${conCupo} con cupo`
    : 'El restaurante no atiende este día';
}

// ---------- RF-02: seleccionar mesa ----------
$('lista-mesas').addEventListener('click', e => {
  const li = e.target.closest('.mesa');
  if (!li) return;
  estado.mesa = db.mesas.find(m => m.id === Number(li.dataset.id));
  estado.fecha = fechaGeneral.value;
  estado.slot = null;
  abrirModal();
});

function abrirModal() { $('modal').hidden = false; document.body.classList.add('sin-scroll'); renderModal(); }
function cerrarModal() { $('modal').hidden = true; document.body.classList.remove('sin-scroll'); renderMesas(); }

// ---------- Menú hamburguesa (móvil) ----------
function alternarMenu(abrir) {
  const abierto = abrir ?? !$('nav').classList.contains('abierto');
  $('nav').classList.toggle('abierto', abierto);
  $('menu-toggle').classList.toggle('abierto', abierto);
  $('menu-toggle').setAttribute('aria-expanded', abierto);
}
$('menu-toggle').onclick = () => alternarMenu();
$('nav').addEventListener('click', e => { if (e.target.closest('a')) alternarMenu(false); });
$('cerrar-modal').onclick = cerrarModal;
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('modal').hidden && !document.querySelector('.dialogo-fondo')) cerrarModal();
  alternarMenu(false);
});

// Si otra pestaña cambia los datos (ej. el admin), se actualiza la página
function alCambiarDatos() {
  renderMesas(); renderDestacados(); renderCarta();
  if (!$('modal').hidden && estado.mesa && !estado.slot) renderModal();
}
$('modal').addEventListener('click', e => { if (e.target.id === 'modal') cerrarModal(); });

// ---------- RF-03, RF-04, RF-05: fecha, slots y formulario ----------
function renderModal() {
  const m = estado.mesa;
  const horario = horarioDeFecha(estado.fecha);
  const slots = slotsDeMesa(m.id, estado.fecha);

  $('modal-contenido').innerHTML = `
    <h3>${esc(m.nombre)}</h3>
    <p class="muted">${m.zona === 'terraza' ? 'Terraza' : 'Salón'} · Capacidad: ${m.capacidad} personas</p>

    <label class="campo">1. Fecha
      <input type="date" id="m-fecha" min="${hoyISO()}" value="${estado.fecha}">
    </label>

    <p class="campo">2. Hora</p>
    ${estado.fecha < hoyISO() ? '<p class="error">No se puede reservar en una fecha pasada. Elige una fecha desde hoy.</p>'
      : !horario ? '<p class="error">El restaurante no atiende ese día. Elige otra fecha.</p>'
      : !slots.some(s => !s.ocupado && !s.pasado) ? '<p class="error">No quedan horarios libres para esta fecha. Prueba otro día.</p>' : ''}
    ${estado.fecha < hoyISO() || !horario ? '' : `
      <ul class="slots">
        ${slots.map(s => `
          <li><button type="button" class="slot ${s.ocupado || s.pasado ? 'ocupado' : ''} ${estado.slot?.hora_inicio === s.hora_inicio ? 'activo' : ''}"
            data-hi="${s.hora_inicio}" title="${s.pasado ? 'Hora pasada' : s.ocupado ? 'Ocupado' : 'Libre'}">${s.hora_inicio}</button></li>`).join('')}
      </ul>
      <p class="leyenda"><span class="dot libre"></span> Libre <span class="dot ocupado"></span> Ocupado</p>`}

    <form id="form-reserva" novalidate ${estado.slot ? '' : 'hidden'}>
      <p class="campo">3. Tus datos</p>
      <label class="campo">Nombre *<input id="m-nombre" required maxlength="60"></label>
      <label class="campo">Número de personas * (máx. ${m.capacidad})
        <input type="number" id="m-personas" min="1" required value="2">
      </label>
      <label class="campo">Contacto (opcional)<input id="m-contacto" maxlength="30" placeholder="Teléfono"></label>
      <button class="btn" type="submit">Confirmar reserva</button>
    </form>`;

  $('m-fecha').onchange = e => { estado.fecha = e.target.value; estado.slot = null; renderModal(); };

  document.querySelectorAll('.slot').forEach(b => b.onclick = () => {
    const s = slots.find(x => x.hora_inicio === b.dataset.hi);
    if (s.pasado) return aviso(`Las ${s.hora_inicio} ya pasaron. Elige una hora más tarde.`, 'error', 'Hora no disponible');
    if (s.ocupado) { // Flujo alternativo: slot ocupado
      aviso(`Las ${s.hora_inicio} ya están reservadas. Elige otro horario.`, 'error', 'Horario ocupado');
      return;
    }
    estado.slot = s;
    renderModal();
  });

  const form = $('form-reserva');
  if (form) form.onsubmit = confirmarReserva;
}

function confirmarReserva(e) {
  e.preventDefault();
  const m = estado.mesa;
  const nombre = $('m-nombre').value.trim();
  const personas = Number($('m-personas').value);
  const contacto = $('m-contacto').value.trim();

  if (nombre.length < 2) return marcarInvalido($('m-nombre'), 'Escribe tu nombre para la reserva.');
  if (!Number.isInteger(personas) || personas < 1) return marcarInvalido($('m-personas'), 'Indica cuántas personas vienen.');
  if (personas > m.capacidad) // Flujo alternativo: capacidad
    return marcarInvalido($('m-personas'), `${m.nombre} admite máximo ${m.capacidad} personas.`);
  if (contacto && !/^[\d\s+()-]{7,20}$/.test(contacto))
    return marcarInvalido($('m-contacto'), 'El contacto debe ser un número de teléfono válido.');

  // Revalidar que el slot siga libre
  const libre = slotsDeMesa(m.id, estado.fecha).find(s => s.hora_inicio === estado.slot.hora_inicio && !s.ocupado && !s.pasado);
  if (!libre) {
    estado.slot = null; renderModal();
    return aviso('Ese horario acaba de ocuparse o ya pasó. Elige otro.', 'error', 'Horario no disponible');
  }

  const reserva = {
    id: db.nuevoId('reservas'),
    mesa_id: m.id,
    cliente_nombre: nombre,
    cliente_contacto: contacto,
    num_personas: personas,
    fecha: estado.fecha,
    hora_inicio: estado.slot.hora_inicio,
    hora_fin: estado.slot.hora_fin,
    estado: 'confirmada',
    creado_en: new Date().toISOString()
  };
  db.reservas.push(reserva);
  if (!db.guardar('reservas')) { db.reservas.pop(); return; }

  // RF-06: confirmación
  $('modal-contenido').innerHTML = `
    <div class="confirmacion">
      <div class="check">✓</div>
      <h3>¡Reserva confirmada!</h3>
      <ul class="lista-datos">
        <li><span>Reserva</span><strong>#${reserva.id}</strong></li>
        <li><span>Nombre</span><strong>${esc(nombre)}</strong></li>
        <li><span>Mesa</span><strong>${esc(m.nombre)}</strong></li>
        <li><span>Fecha</span><strong>${reserva.fecha}</strong></li>
        <li><span>Hora</span><strong>${reserva.hora_inicio} – ${reserva.hora_fin}</strong></li>
        <li><span>Personas</span><strong>${personas}</strong></li>
      </ul>
      <button class="btn" onclick="cerrarModal()">Listo</button>
    </div>`;
}

// ---------- Productos destacados (inicio) ----------
const NOMBRE_CATEGORIA = { hamburguesas: 'Hamburguesa', sushi: 'Sushi', platos: 'Plato a la carta', bebidas: 'Bebida' };

function renderDestacados() {
  const visibles = db.platos.filter(p => p.disponible);
  let lista = visibles.filter(p => p.destacado);
  // Si ninguno está marcado (datos guardados antiguos), se toman los primeros con foto
  if (!lista.length) lista = visibles.filter(p => p.imagen).slice(0, 6);

  $('destacados').hidden = !lista.length;
  $('lista-destacados').innerHTML = lista.slice(0, 6).map((p, i) => `
    <article class="card-destacado ${i === 0 ? 'principal' : ''}">
      ${p.imagen ? `<img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy">` : '<div class="sin-foto"><img src="img/logo.png" alt=""></div>'}
      <div class="card-capa">
        <span class="chip">${NOMBRE_CATEGORIA[p.categoria] || esc(p.categoria)}</span>
        ${i === 0 ? '<span class="chip estrella">★ Favorito de la casa</span>' : ''}
        <div class="card-texto">
          <h3>${esc(p.nombre)}</h3>
          <p>${esc(p.descripcion)}</p>
          <div class="card-pie">
            <span class="card-precio">${formatoPrecio(p.precio)}</span>
            <a href="#mesas" class="card-btn">Reservar mesa →</a>
          </div>
        </div>
      </div>
    </article>`).join('');
}

// ---------- RF-07: carta ----------
const CATEGORIAS_CARTA = { hamburguesas: 'Hamburguesas', sushi: 'Sushi', platos: 'Platos a la carta', bebidas: 'Bebidas' };
const ICONO_CATEGORIA = { hamburguesas: '🍔', sushi: '🍣', platos: '🍽️', bebidas: '🥤' };
let filtroCarta = 'todas';

// Tarjeta de un producto: foto, categoría, nombre, descripción y precio
function tarjetaProducto(p) {
  return `
    <article class="producto">
      <div class="producto-foto">
        ${p.imagen ? `<img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy">`
                   : '<div class="producto-sin-foto"><img src="img/logo.png" alt=""></div>'}
        <span class="producto-chip">${ICONO_CATEGORIA[p.categoria] || ''} ${esc(CATEGORIAS_CARTA[p.categoria] || p.categoria)}</span>
        ${p.destacado ? '<span class="producto-chip estrella">★ Destacado</span>' : ''}
      </div>
      <div class="producto-cuerpo">
        <h4>${esc(p.nombre)}</h4>
        <p>${esc(p.descripcion) || 'Preparado al momento en nuestra cocina.'}</p>
        <div class="producto-pie">
          <span class="producto-precio">${formatoPrecio(p.precio)}</span>
          <a href="#mesas" class="producto-btn">Reservar →</a>
        </div>
      </div>
    </article>`;
}

function renderCarta() {
  const visibles = db.platos.filter(p => p.disponible);
  const cats = Object.keys(CATEGORIAS_CARTA).filter(c => visibles.some(p => p.categoria === c));
  if (filtroCarta !== 'todas' && !cats.includes(filtroCarta)) filtroCarta = 'todas';

  // Pestañas para filtrar por categoría
  const pestanas = `<div class="carta-filtros" role="tablist">
    ${['todas', ...cats].map(c => `<button type="button" role="tab" data-cat="${c}" class="${c === filtroCarta ? 'activo' : ''}">
      ${c === 'todas' ? 'Todo' : `${ICONO_CATEGORIA[c]} ${CATEGORIAS_CARTA[c]}`}
      <span>${c === 'todas' ? visibles.length : visibles.filter(p => p.categoria === c).length}</span></button>`).join('')}
  </div>`;

  const secciones = cats.filter(c => filtroCarta === 'todas' || c === filtroCarta).map(cat => {
    const platos = visibles.filter(p => p.categoria === cat);
    return `<h3 class="categoria">${CATEGORIAS_CARTA[cat]} <small>${platos.length} productos</small></h3>
      <div class="grid-productos">${platos.map(tarjetaProducto).join('')}</div>`;
  }).join('');

  $('lista-carta').innerHTML = pestanas + (secciones || '<p class="muted">Pronto tendremos nuevos productos.</p>');
  $('lista-carta').querySelectorAll('.carta-filtros button').forEach(b => b.onclick = () => {
    filtroCarta = b.dataset.cat;
    renderCarta();
  });
}

// ---------- Inicio ----------
fechaGeneral.min = hoyISO();
fechaGeneral.value = hoyISO();
fechaGeneral.onchange = renderMesas;
renderMesas();
renderDestacados();
renderCarta();
