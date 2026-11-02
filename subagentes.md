# Flujo de trabajo con subagentes por riesgo

## Nombre sugerido
`subagentes.md` (alternativas: `risk-subagents.md`, `orquestacion-subagentes.md`).

## Objetivo
Reducir regresiones en refactorizaciones grandes (UI, migraciones, estilos) lanzando un subagente por cada riesgo identificado, antes de editar, y uno por vista/archivo para validar el resultado.

## Cuándo usarlo
- Migraciones de componentes (header/sidebar).
- Cambios de layout/CSS que afectan múltiples páginas.
- Refactors con alto riesgo de romper JS, impresión, mapas de bus, formularios o datalists.
- Cualquier tarea con 3+ pasos dependientes o múltiples archivos.

## Metodología

### 1. Análisis inicial
- Leer archivos clave (HTML, CSS, JS).
- Identificar estructura, IDs/clases usados por JS, endpoints, impresión, mapas, formularios.
- Listar riesgos concretos (carreras async, geometría, datalists, Flatpickr, impresión, componentes placeholder).

### 2. Un subagente por riesgo
Para cada riesgo, lanzar un subagente `explore` con un prompt acotado:
- Qué archivo(s) analizar.
- Qué verificar exactamente.
- Que no edite.
- Pedir conclusión: "riesgo alto/medio/bajo" + mitigación.

Ejemplo de riesgos típicos:
- Cargador de componentes placeholder.
- Carreras asíncronas DOM vs JS.
- Impresión (`@media print`, contenedores ocultos).
- Geometría de mapas de bus.
- Formularios de dos pasos y datalists.
- Flatpickr/calendario.
- Contenedores de impresión anidados.

### 3. Un subagente por vista/archivo
Después del análisis de riesgos, lanzar un subagente por cada HTML/CSS para:
- Comparar con el formato estándar (ej. `menu.html`).
- Detectar markup redundante.
- Detectar reglas CSS sobrescritas por `!important`.
- Proponer cambios exactos.
- No editar.

### 4. Plan consolidado
- Unir hallazgos en un plan por fases.
- Incluir mitigaciones por riesgo.
- Definir orden de migración (una vista a la vez).
- Definir validación final.

### 5. Ejecución controlada
- Aplicar cambios por lotes pequeños.
- Mantener IDs/clases críticas.
- No romper endpoints ni datos.
- Verificar después de cada lote.

### 6. Validación final
- Subagente por vista para verificar:
  - Estructura correcta.
  - Estilos consistentes.
  - Emojis visibles.
  - Background original.
  - Sin errores de consola.
  - Funcionalidad e impresión intactas.

## Reglas
- No editar durante la fase de análisis.
- No asumir que una librería está disponible.
- Preservar IDs/clases usados por JS.
- No anidar contenedores de impresión dentro de elementos ocultos.
- Mantener geometría de mapas de bus.
- Usar `!important` solo cuando sea necesario y documentarlo.
- Probar en navegador después de cada cambio relevante.

## Plantilla de prompt para subagente
```
Analiza <archivo> con <css> y <js>.
Identifica:
- markup reemplazable
- IDs/clases que deben preservarse
- restricciones (impresión, mapas, formularios, datalists, Flatpickr)
- riesgos
No edites. Devuelve bullets concisos.
```

## Resultado esperado
- Menos regresiones.
- Cambios más pequeños y verificables.
- Documentación clara de decisiones y riesgos.
- Mejor trazabilidad para futuras sesiones.
