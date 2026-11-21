---
name: react-component-generator
description: >
  Use when construir o modificar componentes React (JSX) cohesionados,
  accesibles y con pruebas: páginas, modales, tablas, formularios y componentes
  presentacionales, usando los componentes de components/ui del proyecto.
  Adaptación React de SK-014. Follow approved architecture, verified contracts,
  project conventions and controlled autonomy.
---

# SK-014R — React Component Generator

**Versión:** v0.1  
**Estado:** v0.1, adaptada de las skills React de erpIA (2026-11-20); se ajusta con el primer uso en este proyecto  
**Ámbito:** Claude Code · React 18 / JavaScript (JSX), Vite, React Router v6, Vitest  
**Origen:** adaptación de SK-014 `component-generator` v0.3

## Objetivo

Construir componentes React cohesionados, accesibles y probados, reutilizando la UI que el proyecto ya tiene.

## Directrices normativas

### REACT_COMPONENT-01

Definir una responsabilidad visual clara. Antes de implementar, identificar la responsabilidad de composición (Layout, Page, Container, Component o Dialog, SK-008R-14) y la naturaleza del componente (presentacional, contenedor o conectado, SK-008R-11). Clasificar no obliga a crear componentes adicionales.

### REACT_COMPONENT-02

Respetar la versión instalada (`package.json`): componentes función y hooks; si es React 18, no usar APIs de React 19 (`use`, `useActionState`, `useOptimistic`, acciones de formulario); componentes de clase solo para un error boundary.

### REACT_COMPONENT-03

Props mínimas y explícitas: datos por props, eventos como callbacks `on<Evento>` (`onSave`, `onClose`), sin pasar el `setState` del padre. Documentar las props con JSDoc cuando el componente sea compartido. No cambiar las props de un componente de `components/ui` sin aprobación: es un contrato público usado en muchas páginas.

### REACT_COMPONENT-04

JSX simple y semántico: `key` estable tomada del dato (`row.id`, `_key` en filas nuevas), nunca el índice del arreglo cuando la lista se reordena, filtra o edita; condiciones complejas y cálculos fuera del JSX, en variables o en `libs/`.

### REACT_COMPONENT-05

Estilos en CSS Modules (`*.module.css`) del componente, o las clases compartidas del proyecto (botones, grillas de formulario, botones de ícono). Sin estilos globales nuevos, sin `style` en línea salvo valores dinámicos, sin bibliotecas de UI no aprobadas.

### REACT_COMPONENT-06

Estado local mínimo: lo derivable se calcula en el render (o con `useMemo` si es caro y medido), no se copia en otro `useState` ni se sincroniza con `useEffect`. Formularios, HTTP y estado de la pantalla se delegan en SK-017R, SK-015R y SK-012R.

### REACT_COMPONENT-07

Accesibilidad: cada control con etiqueta (`<label htmlFor>` o `aria-label`), botones de solo ícono con `aria-label` y `title`, foco visible, teclado completo (Tab, Enter, Esc), errores asociados con `aria-describedby` y estados de carga, vacío y error visibles.

### REACT_COMPONENT-08

No crear un componente por cada etiqueta ni extraer algo usado una sola vez sin otra razón (tamaño, prueba, legibilidad). Un componente nuevo en `components/ui` requiere al menos dos consumidores reales (SK-008R-12).

### REACT_COMPONENT-09

Un modal usa el componente de modal compartido del proyecto, nunca un overlay nuevo. Verificar que sea accesible: `role="dialog"`, `aria-modal`, `aria-labelledby` con su título, cierre con Esc, foco retenido dentro y devuelto al cerrar, y botón de cerrar con nombre accesible. Lo que le falte se corrige una sola vez en el componente compartido (cambio de contrato con aprobación), no en cada página. Si el proyecto no tiene modal compartido, crearlo es el primer paso.

### REACT_COMPONENT-10

El contrato de un modal es explícito: props `open`, `data` (entrada) y `onClose(result)`, donde `onClose()` sin argumento es cancelación. Documentar con JSDoc la forma de `data` y del resultado en `models/types/` del diálogo (SK-008R-09). El modal que guarda es dueño de su envío (SK-017R-09).

### REACT_COMPONENT-11

Reutilizar la UI existente antes de escribir marcado. Revisar primero el catálogo de la UI compartida del proyecto (`src/shared/ui` o `src/components/ui`) y el `CLAUDE.md`. Para cada necesidad, usar el componente compartido que la cubre:

| Necesito… | Componente compartido esperado (crearlo con aprobación si no existe) |
|---|---|
| Una tabla con orden y paginación (cliente o servidor) | Tabla de datos con columnas, acciones por fila y paginación del backend |
| Un select con FK o muchas opciones | Select con búsqueda; nunca `<select>` nativo para FK |
| Buscar en un listado | Barra de búsqueda |
| Confirmar una acción o una eliminación | Modal de confirmación; nunca `window.confirm` |
| Un formulario simple | Modal compartido con su formulario |
| Iconos de acción (editar, eliminar…) | Módulo compartido de iconos (`src/shared/icons`); no copiar SVG en cada página |

Como referencia, en erpIA estos son `DataTable`, `SearchableSelect`, `SearchBar`, `ConfirmModal`/`ConfirmDeleteModal`, `Modal` y `shared/icons`.

Si el patrón no encaja, proponer ampliar el componente compartido (contrato público, requiere aprobación) en vez de copiar su marcado.

### REACT_COMPONENT-12

Respetar las reglas de UI del `CLAUDE.md` del proyecto (componentes obligatorios, dónde va el título, textos de botones, patrones de página). Si no las define, proponerlas en el primer cambio que las necesite, no inventarlas en cada página.

## Procedimiento operativo

1. Revisar componentes similares, la UI compartida del proyecto (`src/shared/ui` o `src/components/ui`) y las reglas de UI de `CLAUDE.md`.
2. Definir responsabilidad, props, callbacks y composición.
3. Implementar JSX, estilos e interacción.
4. Probar con Testing Library: render, interacción, casos límite y accesibilidad básica (roles y nombres).
5. Ejecutar `npx vitest run` y `npx vite build`; reportar resultado y limitaciones.

## Criterios de aceptación

- **AC-01:** Propósito y props claros; callbacks `on<Evento>`.
- **AC-02:** Accesibilidad y comportamiento relevante probados.
- **AC-03:** Sin reglas de negocio ni llamadas a la API en componentes presentacionales.
- **AC-04:** Responsabilidad de composición y naturaleza identificadas (-01).
- **AC-05:** Modales sobre la infraestructura del proyecto, con contrato `open`/`data`/`onClose(result)` (-09, -10).
- **AC-06:** Sin marcado repetido cuando existe un componente compartido para ese patrón (-11).
- **AC-07:** `key` estables en listas (-04).

## Política de autonomía y verificación

Esta skill hereda **SK-001 `software-engineering`**. Claude puede ejecutar cambios locales de bajo o medio riesgo dentro del alcance solicitado; requiere aprobación explícita antes de cambiar arquitectura significativa, contratos públicos incompatiblemente, seguridad/autorización, reglas de negocio, persistencia o dependencias fundamentales. No inferir permiso para merge o despliegue.

La evidencia se rige por **SK-003 `software-quality`**: usar `PASSED`, `PASSED_WITH_OBSERVATIONS`, `FAILED`, `BLOCKED` o `NOT_VERIFIED`. Informar comandos realmente ejecutados y resultados; no inventarlos. Referenciar otras skills **no implica invocarlas automáticamente**: aplicar sus reglas consultando su contenido disponible o coordinando explícitamente su ejecución.

Todo cambio respeta las garantías de cambio seguro (si el proyecto tiene un roadmap o un `CLAUDE.md` con reglas propias, se suman): un paso por commit revertible, mover o cambiar pero nunca ambas cosas, y las pruebas nunca bajan.

## Antipatrones que deben evitarse

- Complejidad o scaffolding sin necesidad comprobada.
- Modificar contratos o decisiones aprobadas sin autorización.
- Inventar requisitos, APIs, pruebas o resultados.
- Aplicar patrones por moda o por la denominación de una carpeta.
- Ocultar errores y limitaciones del entorno.
- `useEffect` para copiar props o derivar estado.
- Componentes definidos dentro de otro componente (se recrean en cada render y pierden su estado).
- Iconos SVG o modales copiados de otra página.

## Entregables proporcionales

- Implementación o diagnóstico solicitado y sus contratos afectados.
- Explicación breve de decisiones y alternativas significativas.
- Pruebas o validaciones pertinentes y evidencia real.
- Riesgos, bloqueos y decisiones pendientes si los hubiera.

## Relación con otras skills

- **`react-project-structure`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-forms`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-state`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-testing`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`atomic-design`**: aplicar las reglas pertinentes sin presuponer ejecución automática.

## Resultado esperado

Una solución coherente con las responsabilidades y límites aprobados, comprensible, verificable y proporcional al problema. El informe final debe distinguir **implementado**, **verificado** y **pendiente**.
