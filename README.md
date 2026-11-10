# Ruta 18 · Sistema de Reservas de Mesas (solo frontend)

Aplicación web en HTML, CSS y JavaScript vanilla. Los datos viven en **listas de JavaScript**
(`js/data.js`) en lugar de Supabase y se guardan en `localStorage` del navegador para que el
módulo cliente y el panel de administración compartan la información.

## Cómo usarlo
Abre `index.html` en el navegador (doble clic). No requiere instalación ni servidor.

- **Cliente:** `index.html` — lista de mesas, reserva (fecha → hora → datos → confirmación) y carta.
- **Administrador:** `admin.html` — usuario `admin123`, contraseña `admin2026`. Lo que agregues (productos, fotos, mesas, horarios, reservas) se guarda en el navegador (localStorage).

Para volver a los datos iniciales, borra el almacenamiento del sitio en el navegador
o ejecuta en la consola: `Object.keys(localStorage).filter(k=>k.startsWith('ruta18v2_')).forEach(k=>localStorage.removeItem(k))`.

## Despliegue en Vercel
El proyecto es estático (no necesita build). `vercel.json` activa `cleanUrls`, así el panel
queda en `/admin` (RF-08).

1. Sube el repositorio a GitHub.
2. En https://vercel.com/new importa el repositorio.
3. Framework Preset: **Other**. Build Command y Output Directory: vacíos. Clic en **Deploy**.

Cada `git push` a `main` vuelve a desplegar automáticamente.

## Estructura
```
index.html       Página del cliente
admin.html       Panel de administración
css/styles.css   Estilos y diseño responsivo
js/data.js       Listas de datos (mesas, horarios, reservas, platos) y utilidades
js/cliente.js    Lógica del módulo cliente
js/admin.js      Lógica del módulo administrador
```

## Requisitos cubiertos
| Requisito | Dónde |
|---|---|
| RF-01 Visualización de mesas | Lista de mesas en `index.html` (nombre, zona, capacidad, estado) |
| RF-02 Selección de mesa | Clic en una mesa abre el flujo de reserva |
| RF-03 Elección de fecha | Selector de fecha; avisa si el restaurante no atiende ese día |
| RF-04 Horarios disponibles | Grilla de slots (verde libre / gris ocupado) |
| RF-05 Reserva | Nombre, personas (≤ capacidad), contacto opcional; el slot pasa a ocupado |
| RF-06 Confirmación | Comprobante en pantalla con todos los datos |
| RF-07 Carta | Por categorías; los platos no disponibles no se muestran |
| RF-08 Acceso admin | `admin.html` con contraseña simple |
| RF-09 / RF-10 Mesas | Agregar, editar, borrar y listar mesas |
| RF-11 Horarios | Horario por día y duración de la reserva |
| RF-12 Reservas | Lista con filtros por fecha y mesa; cambio de estado |
| RF-13 Estado de mesa | Activar / desactivar (las inactivas no aparecen al cliente) |
| RF-14 Carta | Agregar, editar, ocultar y eliminar platos |

## Imágenes
Las fotos de `img/` provienen de la galería de Google del restaurante (Ruta 18 And Chips),
publicadas por clientes. Se usan solo con fines académicos; para uso comercial conviene
reemplazarlas por fotos propias del restaurante.

Fuera del alcance de esta versión: Supabase, GitHub y Vercel.
