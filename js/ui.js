/* =========================================================
   ui.js — Tarjetas de confirmación, avisos y validación
   Reemplaza alert() y confirm() del navegador.
   ========================================================= */

const ICONOS = { exito: '✓', error: '!', info: 'i', peligro: '🗑' };

// ---------- Avisos (toast) ----------
function aviso(mensaje, tipo = 'info', titulo) {
  let zona = document.getElementById('zona-avisos');
  if (!zona) {
    zona = document.createElement('div');
    zona.id = 'zona-avisos';
    zona.setAttribute('aria-live', 'polite');
    document.body.appendChild(zona);
  }
  // Un solo aviso de error a la vez: el nuevo reemplaza al anterior
  if (tipo === 'error') zona.querySelectorAll('.aviso-error').forEach(a => a.remove());
  const titulos = { exito: '¡Listo!', error: 'Revisa los datos', info: 'Aviso' };
  const card = document.createElement('div');
  card.className = `aviso aviso-${tipo}`;
  card.innerHTML = `
    <span class="aviso-icono">${ICONOS[tipo] || 'i'}</span>
    <div class="aviso-texto"><strong>${esc(titulo || titulos[tipo] || 'Aviso')}</strong><span>${esc(mensaje)}</span></div>
    <button class="aviso-cerrar" aria-label="Cerrar">×</button>`;
  const quitar = () => { card.classList.add('saliendo'); setTimeout(() => card.remove(), 250); };
  card.querySelector('.aviso-cerrar').onclick = quitar;
  zona.appendChild(card);
  setTimeout(quitar, tipo === 'error' ? 4500 : 3000);
}

// ---------- Confirmación (devuelve una promesa true/false) ----------
function confirmar({ titulo = '¿Estás seguro?', mensaje = '', textoOk = 'Aceptar', textoCancelar = 'Cancelar', peligro = false } = {}) {
  return new Promise(resolver => {
    const fondo = document.createElement('div');
    fondo.className = 'dialogo-fondo';
    fondo.innerHTML = `
      <div class="dialogo" role="alertdialog" aria-modal="true">
        <span class="dialogo-icono ${peligro ? 'peligro' : ''}">${peligro ? ICONOS.peligro : '?'}</span>
        <h3>${esc(titulo)}</h3>
        ${mensaje ? `<p>${esc(mensaje)}</p>` : ''}
        <div class="dialogo-acciones">
          <button class="btn sec" data-r="0">${esc(textoCancelar)}</button>
          <button class="btn ${peligro ? 'btn-peligro' : ''}" data-r="1">${esc(textoOk)}</button>
        </div>
      </div>`;
    const cerrar = valor => {
      document.removeEventListener('keydown', teclas);
      fondo.classList.add('saliendo');
      setTimeout(() => fondo.remove(), 200);
      resolver(valor);
    };
    const teclas = e => { if (e.key === 'Escape') cerrar(false); };
    fondo.addEventListener('click', e => {
      if (e.target === fondo) return cerrar(false);
      const b = e.target.closest('[data-r]');
      if (b) cerrar(b.dataset.r === '1');
    });
    document.addEventListener('keydown', teclas);
    document.body.appendChild(fondo);
    fondo.querySelector('[data-r="1"]').focus();
  });
}

// ---------- Ícono de mesa (vista desde arriba) ----------
// Dibuja la mesa con tantas sillas como su capacidad: redonda hasta 4, rectangular desde 5.
function iconoMesa(capacidad, zona) {
  const n = Math.max(1, Math.min(Number(capacidad) || 2, 12));
  const silla = (x, y, rot) =>
    `<rect x="${x - 7}" y="${y - 5}" width="14" height="10" rx="4" transform="rotate(${rot} ${x} ${y})" class="silla"/>`;
  let sillas = '', mesa;

  if (n <= 4) {
    mesa = '<circle cx="50" cy="50" r="22" class="tablero"/><circle cx="50" cy="50" r="15" class="centro"/>';
    for (let i = 0; i < n; i++) {
      const a = (360 / n) * i - 90, r = a * Math.PI / 180;
      sillas += silla(50 + Math.cos(r) * 34, 50 + Math.sin(r) * 34, a + 90);
    }
  } else {
    const porLado = Math.ceil(n / 2), ancho = Math.max(44, porLado * 18);
    const x0 = 50 - ancho / 2;
    mesa = `<rect x="${x0}" y="36" width="${ancho}" height="28" rx="7" class="tablero"/>
            <rect x="${x0 + 6}" y="42" width="${ancho - 12}" height="16" rx="4" class="centro"/>`;
    const fila = (cant, y, rot) => {
      for (let i = 0; i < cant; i++) sillas += silla(x0 + (ancho / cant) * (i + .5), y, rot);
    };
    fila(porLado, 24, 0);
    fila(n - porLado, 76, 180);
  }
  return `<svg viewBox="0 0 100 100" class="icono-mesa zona-${zona === 'terraza' ? 'terraza' : 'salon'}" role="img" aria-label="Mesa para ${n} personas">
    ${sillas}${mesa}</svg>`;
}

// ---------- Validación de formularios ----------
// Revisa los campos required/min/max y muestra el primer error en un aviso.
function validarFormulario(form) {
  form.querySelectorAll('.invalido').forEach(c => c.classList.remove('invalido'));
  for (const campo of form.querySelectorAll('input, select')) {
    if (campo.type === 'hidden' || campo.type === 'file' || campo.type === 'checkbox') continue;
    const etiqueta = (campo.closest('label')?.firstChild?.textContent || 'Este campo').replace('*', '').trim();
    const valor = campo.value.trim();
    let error = '';
    if (campo.required && !valor) error = `${etiqueta} es obligatorio.`;
    else if (campo.type === 'number' && valor) {
      const n = Number(valor);
      if (campo.min !== '' && n < Number(campo.min)) error = `${etiqueta}: el mínimo es ${campo.min}.`;
      else if (campo.max !== '' && n > Number(campo.max)) error = `${etiqueta}: el máximo es ${campo.max}.`;
    } else if (campo.type === 'url' && valor && !/^https?:\/\//.test(valor)) error = `${etiqueta} debe empezar con http:// o https://`;
    if (error) { marcarInvalido(campo, error); return false; }
  }
  return true;
}

function marcarInvalido(campo, mensaje) {
  campo.classList.add('invalido');
  campo.focus();
  campo.addEventListener('input', () => campo.classList.remove('invalido'), { once: true });
  aviso(mensaje, 'error');
}
