---
name: react-component-decomposition
description: >
  Use when el usuario pide analizar una página o componente React (JSX) grande o problemático para
  partirlo en piezas cohesivas de una sola responsabilidad: diagnosticar su condición, detectar code
  smells (página que hace todo, varias vistas en un componente, modales u overlays acumulados, estado
  que todo lo conecta, funciones largas, bloques duplicados, componentes definidos dentro de otros) y
  proponer las nuevas unidades (página, containers, dialogs, forms, components, hook de estado,
  servicios, libs, mappers) ubicadas según SK-008R. Solo analiza y documenta: no crea ni modifica código.
  Adaptación React de SK-026 component-decomposition.
argument-hint: "<ruta de la página .jsx> [--component Nombre] [--min-region 25] [--min-dup 12]"
allowed-tools: Bash(node .claude/skills/react-component-decomposition/scripts/inspect-jsx.mjs:*), Bash(node .claude/skills/react-ui-reuse/scripts/ui-reuse-jsx.mjs:*), Bash(ls:*), Bash(mkdir:*), Bash(grep:*), Bash(wc:*), Read, Write
---

# SK-026R — React Component Decomposition

**Versión:** v0.1  
**Estado:** v0.1, adaptada de las skills React de erpIA (2026-11-20); se ajusta con el primer uso en este proyecto  
**Ámbito:** Claude Code · React 18 / JavaScript (JSX), Vite, React Router v6, Vitest  
**Origen:** adaptación de SK-026 `component-decomposition` (su script lee plantillas Angular; este lee JSX)

## Objetivo

Diagnosticar con evidencia la condición de una página o componente React y proponer cómo descomponerlo
en unidades cohesivas, cada una con una sola responsabilidad, ubicadas según SK-008R y las
convenciones de `CLAUDE.md` del proyecto.

## Directrices normativas

### REACT_COMPONENT_DECOMPOSITION-01

Esta skill **solo analiza y documenta**. Crear componentes, mover código o cambiar estilos corresponde
a `react-component-generator`, `react-forms`, `react-state` y `react-data-layer`, y requiere aprobación.

### REACT_COMPONENT_DECOMPOSITION-02

Lo medible lo mide el script (`scripts/inspect-jsx.mjs`): no contar estados, funciones, líneas ni
duplicados a mano. Quien analiza lee el código y decide.

### REACT_COMPONENT_DECOMPOSITION-03

Un smell se reporta solo con evidencia leída (`archivo:líneas`). La señal del script abre la sospecha;
la lectura la confirma o la descarta. Los descartados se mencionan con su motivo.

### REACT_COMPONENT_DECOMPOSITION-04

La estructura destino sigue SK-008R-09: página `<x>/`, `containers/`, `dialogs/`, `forms/`, `shared/`
y, dentro de cada unidad, `components/`, `state/use<X>Store.js`, `actions/`, `libs/`, `mappers/`,
`models/` y `tests/`, solo con las carpetas que tendrían contenido (SK-008R-08).

### REACT_COMPONENT_DECOMPOSITION-05

Las convenciones del `CLAUDE.md` del proyecto mandan: patrones de página, componentes compartidos
obligatorios (modales, tablas, selects), iconos y dónde va el título. Si la propuesta difiere de
SK-008R, seguir al proyecto y señalar la diferencia. Si el proyecto no las define, la propuesta las
sugiere como decisión a aprobar.

### REACT_COMPONENT_DECOMPOSITION-06

Separar el estado antes que el JSX. Si los hijos propuestos dependen de un estado compartido (hub),
el informe propone primero su `use<X>Store` (SK-012R-03/04) o su formulario (`react-forms`); partir
solo el JSX produce hijos con decenas de props.

### REACT_COMPONENT_DECOMPOSITION-07

No crear unidades para clasificar ni componentes envoltorio sin responsabilidad (SK-008R-14,
SK-014R-08). Bloques pequeños sin lógica pueden quedar en la página.

### REACT_COMPONENT_DECOMPOSITION-08

Mover la página a `features/`, cambiar rutas o URL, agregar a la UI compartida (`shared/` o `components/ui`), y cambiar
props de un componente compartido se proponen como **requiere aprobación**.

### REACT_COMPONENT_DECOMPOSITION-09

El plan respeta las garantías de cambio seguro: primero la prueba de la página si no existe,
después movimientos sin cambio de comportamiento y luego cambios sin mover archivos, un commit por
paso, con pruebas, build y lint en verde.

## Pasos

### 1. Conocer el proyecto

Leer el `CLAUDE.md` del proyecto (reglas de UI y patrones de página), SK-008R
(`react-project-structure`) y el catálogo de componentes compartidos (`src/shared`, `src/components`).

### 2. Medir

Desde la raíz del proyecto React (donde está `package.json`). Salida en `docs/decomposition/`
con nombre `<Pagina>-descomposicion-<YYYY-MM-DD>`:

```bash
node .claude/skills/react-component-decomposition/scripts/inspect-jsx.mjs src/<ruta>/<Pagina>.jsx \
  --json docs/decomposition/<Pagina>-descomposicion-<fecha>.json \
  > docs/decomposition/<Pagina>-descomposicion-<fecha>.md
```

Opciones: `--component Nombre` (si el archivo tiene varios componentes; por defecto el `export default`),
`--min-region N` (por defecto 25), `--min-dup N` (por defecto 12). Si falla por `@babel/parser`, el
proyecto no tiene dependencias instaladas: pedir `npm install`.

El `.md` es un **borrador con datos**: condición, inventario, estado y hubs, funciones y efectos con
complejidad, grupos cohesivos, regiones del JSX con su estado exclusivo, modos, modales y overlays,
duplicados y señales de las reglas del proyecto.

### 3. Clasificar la condición

Usar el nivel global y la tabla del borrador, interpretados con `references/thresholds.md`. Una página
Saludable o en Observación sin smells confirmados no se descompone: informar y terminar.

### 4. Leer el código y confirmar smells

Recorrer `references/smells.md`. Leer las ubicaciones del borrador (inicio de cada región grande, las
funciones más largas y complejas, los hubs y los pares duplicados) y confirmar o descartar con evidencia.

### 5. Agrupar por cohesión

Cruzar los grupos cohesivos (estado y funciones conectados sin pasar por hubs), las regiones del JSX
(qué estado y funciones usa cada una y cuál le es exclusivo) y los modos (cada vista alternativa suele
ser una unidad). Cada grupo que coincide con una región es candidato a unidad.

### 6. Decidir la ubicación

Para cada candidato: naturaleza (presentacional, contenedor, conectado o sección de formulario),
destino según SK-008R, contrato (props y callbacks `on<Evento>`, o el hook de estado) y rangos de
origen. Si un bloque parece repetirse en otras páginas, verificarlo con `react-ui-reuse`:

```bash
node .claude/skills/react-ui-reuse/scripts/ui-reuse-jsx.mjs --example src/<ruta>/<x>.jsx:<inicio>-<fin>
```

### 7. Escribir el informe y responder

Reescribir el `.md` con `references/report.md`. En el chat: condición, hallazgos principales, tabla
de unidades propuestas, enlace al informe y lo que requiere aprobación, sin ejecutar el plan.

## Criterios de aceptación

- **AC-01:** El borrador se generó con `inspect-jsx.mjs` y el informe enlaza su `.json`.
- **AC-02:** Cada smell reportado tiene evidencia `archivo:líneas`; los descartados tienen su motivo.
- **AC-03:** Cada unidad propuesta tiene naturaleza, destino SK-008R, origen, responsabilidad y contrato.
- **AC-04:** El estado compartido (hubs) tiene un dueño propuesto antes de partir el JSX.
- **AC-05:** La propuesta respeta `CLAUDE.md` y señala las diferencias con SK-008R.
- **AC-06:** El plan va de menor a mayor riesgo y cada paso cierra con pruebas, build y lint.
- **AC-07:** Los cambios que requieren aprobación están listados.
- **AC-08:** No se modificó código del proyecto; solo se escribieron el informe y su `.json`.

## Política de autonomía y verificación

Esta skill hereda **SK-001 `software-engineering`**. Solo escribe el informe y su `.json`. Cualquier
cambio de código requiere aprobación explícita y se hace con las skills generadoras.

La evidencia se rige por **SK-003 `software-quality`**: informar los comandos ejecutados y sus
resultados. Si el script no pudo leer el archivo, decirlo y marcar las conclusiones como `NOT_VERIFIED`.

Todo cambio respeta las garantías de cambio seguro (si el proyecto tiene un roadmap o un `CLAUDE.md` con reglas propias, se suman): un paso por commit revertible, mover o cambiar pero nunca ambas cosas, y las pruebas nunca bajan.

## Límites conocidos

- El estado se detecta en `useState`/`useReducer` del componente analizado; el que llega por props,
  Context o hooks propios figura como hook personalizado, sin desglose.
- Las referencias se detectan por nombre: una variable local con el mismo nombre que un estado cuenta de más.
- Los modos se detectan como `return` de JSX dentro de un `if`; una página que alterna vistas con un
  ternario dentro del mismo `return` aparece como rama de ternario.
- La duplicación se mide dentro del archivo; entre archivos, usar `react-ui-reuse`.
- La señal de botón de alta distinto de `+ Nuevo` y los nombres de modal reconocidos (`Modal`, `ConfirmModal`, `ConfirmDeleteModal`) son convenciones de erpIA; si el proyecto usa otras, ajustarlas en el script o leer esas señales como informativas.

## Antipatrones que deben evitarse

- Partir el JSX dejando todo el estado y la lógica en la página.
- Convertir cada sección de formulario en un componente con una prop por campo.
- Crear un componente por cada `<div>` sin responsabilidad propia.
- Proponer un componente compartido sin revisar el catálogo ni la repetición fuera de la página.
- Mezclar en el plan correcciones ajenas a la descomposición sin señalarlas.
- Inventar métricas, ubicaciones o resultados.

## Relación con otras skills

- **`react-project-structure`**: estructura destino. Obligatoria.
- **`react-state`**: dueño y forma del estado extraído.
- **`react-component-generator`**, **`react-forms`**, **`react-data-layer`**: implementación posterior.
- **`react-ui-reuse`**: evidencia de repetición fuera de la página.
- **`code-metrics`**: métricas del proyecto completo para comparar antes y después.
- **`mermaid-diagram-style`**: estilo de los diagramas del informe.

## Resultado esperado

Un informe que permite decidir e implementar la descomposición por pasos, con evidencia verificable,
unidades cohesivas ubicadas según SK-008R y una lista de lo que requiere aprobación. El informe
distingue **medido**, **confirmado** y **propuesto**.
