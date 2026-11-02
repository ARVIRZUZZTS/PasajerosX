# Componentes compartidos: Header y Sidebar

## Objetivo
Unificar el `header` y el `sidebar` en todo el sistema, usando el formato de `menu.html` (sidebar pegado a la izquierda, 256px, fondo `rgba(255,255,255,0.95)`, botones pastel con hover mas oscuro y emojis visibles). El codigo actual esta duplicado y desordenado; estos componentes deben ser la unica fuente de verdad.

## Estructura propuesta
```
components/
  header.html
  sidebar.html
  layout.css
  layout.js
```

## Especificaciones
### Header
- Logo `img/logoX.png`
- Titulo por pagina
- Fecha y hora en vivo
- Fondo `rgba(255,255,255,0.95)`
- Sin padding interno en `img`, `h1`, `h3`, `div`

### Sidebar
- Contenedor `#botones` / `.botones`
- Ancho fijo 256px, pegado a la izquierda
- Fondo `rgba(255,255,255,0.95)`
- Botones `.bot > button` con emoji + texto
- Paleta pastel por grupo de accion
- Hover: tono mas oscuro sin afectar emojis
- Sin colapso

## Mecanismo de inclusion (recomendado)
- Opcion A: convertir vistas a `.php` y usar `include 'components/header.php'` / `include 'components/sidebar.php'` con variables `$pageTitle` y `$buttons`.
- Opcion B: mantener `.html` y cargar con `components/layout.js` en contenedores `#app-header` y `#app-sidebar`.

## Migracion por vista
1. Reemplazar `<header>` estatico por contenedor del componente.
2. Reemplazar `#botones/.botones` estatico por contenedor del sidebar.
3. Mantener todos los IDs/clases usados por JS (`#lista`, `#bus`, `#dinamic`, etc.).
4. Definir botones por pagina en un array/configuracion para generar el sidebar.

## Validacion
- Un subagente por vista para verificar:
  - Componente visible y consistente
  - Sidebar pegado a la izquierda
  - Emojis visibles
  - Background original intacto
  - Sin errores de consola
  - Funcionalidad (crear, editar, imprimir, borrar) intacta

## Estado
- Migración aplicada en todas las vistas (`*.html`) usando `components/layout.js` con carga sincrónica.
- Componentes compartidos en `components/` (`header.html`, `sidebar.html`, `layout.css`, `layout.js`).
- Validación visual/funcional pendiente en navegador.
