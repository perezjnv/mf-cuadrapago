# Umbrales de condición (React)

`inspect-jsx.mjs` asigna un nivel por métrica y un nivel global. Son puntos de partida para decidir
dónde mirar, no reglas de aceptación: un valor alto es smell solo si la lectura lo confirma.

| Métrica | Qué mide | Observación | Smell | Crítico |
|---|---|---:|---:|---:|
| `fileLines` | Líneas del archivo | 300 | 500 | 1000 |
| `componentLines` | Líneas del componente analizado | 250 | 400 | 800 |
| `useState` | `useState` + `useReducer` del componente | 8 | 15 | 25 |
| `effects` | `useEffect` + `useLayoutEffect` | 3 | 5 | 8 |
| `functions` | Funciones declaradas dentro del componente | 12 | 20 | 35 |
| `modals` | `Modal`, `ConfirmModal`, `ConfirmDeleteModal` en el archivo | 2 | 3 | 5 |
| `customOverlays` | Objetos de estilo con `position: fixed` e `inset: 0` | 1 | 1 | 2 |
| `modeSwitches` | Vistas alternativas (`return` de JSX dentro de un `if`, ternarios grandes) | 1 | 1 | 2 |
| `maxFunctionLines` | Función o efecto más largo | 40 | 60 | 120 |
| `maxComplexity` | Complejidad ciclomática máxima de una función o efecto | 10 | 15 | 25 |
| `jsxDepth` | Anidamiento máximo de elementos JSX | 10 | 14 | 20 |
| `nestedComponents` | Componentes definidos dentro del componente | 1 | 2 | 4 |
| `lcom4` | Componentes conexos del grafo funciones↔estado (con ≥ 15 miembros) | 2 | 4 | 8 |

## Nivel global

| Nivel | Regla |
|---|---|
| Crítico | 2 o más métricas en Crítico |
| Smell | 1 métrica en Crítico, o 3 o más en Smell |
| Observación | 1 o más en Smell, o 3 o más en Observación |
| Saludable | El resto |

## Cómo leerlos en un panel de administración

- `modals = 2` es lo normal de un CRUD en modal (formulario + confirmación de eliminar): por eso es
  observación y no smell. Más modales suelen ser procesos distintos que van a `dialogs/` (SK-008R-09).
- `customOverlays ≥ 1` incumple SK-014R-09: el overlay debe ser el modal compartido del proyecto.
- `modeSwitches = 1` es un master-detail (lista y formulario en la misma página). Es aceptable si el proyecto lo usa,
  pero cada vista suele ser una unidad: la página queda como coordinadora de las dos.
- `lcom4 = 1` en una página grande **no** es buena señal: suele significar que `form`, `editing` o
  `view` conectan todo. Mirar la tabla de hubs.
- `maxFunctionLines` alto en una función que devuelve JSX (`renderX`) es una región: candidata a componente.
- Las señales de reglas (`window.confirm`, `catch` vacío, `key` con índice, `localStorage`, `<select>`
  nativo, iconos locales) no suben el nivel: son correcciones aparte de la
  descomposición.
