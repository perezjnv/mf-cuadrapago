---
name: react-state
description: >
  Use when decidir o implementar el estado de una pantalla React: estado local,
  hooks de estado por unidad (use<X>Store con useReducer/useState), Context para
  hijos conectados, estado del servidor, carga, errores, cancelación y carreras.
  Adaptación React de SK-012 y SK-018. Follow approved architecture, verified
  contracts, project conventions and controlled autonomy.
---

# SK-012R / SK-018R — React State

**Versión:** v0.1  
**Estado:** v0.1, adaptada de las skills React de erpIA (2026-11-20); se ajusta con el primer uso en este proyecto  
**Ámbito:** Claude Code · React 18 / JavaScript (JSX), Vite, React Router v6, Vitest  
**Origen:** adaptación de SK-012 `angular-state-management` y SK-018 `state-generator`

## Objetivo

Definir quién posee cada estado, cuánto vive y cuál es su fuente de verdad, e implementarlo con hooks sin librerías nuevas.

## Directrices normativas

### REACT_STATE-01

Distinguir estado local (un control), de pantalla (listado, filtro, modal abierto), compartido de sesión (`AuthContext`: usuario, empresa, sucursal, año), de navegación (URL y query params), del servidor (datos de la API) y persistente (`localStorage`, solo preferencias como `useTablePrefs`).

### REACT_STATE-02

Asignar a cada estado un dueño, sus consumidores, su ciclo de vida y su fuente de verdad. Un dato que ya está en la URL o en `AuthContext` no se copia en un `useState`.

### REACT_STATE-03

Preferir `useState` local cuando basta. Cuando una pantalla tiene varios estados que cambian juntos (lista, carga, error, filtro, paginación, modal), agruparlos en un hook `use<X>Store` con `useReducer` o varios `useState`, en `state/` de la unidad (SK-008R-09).

### REACT_STATE-04

El hook expone el estado y operaciones con nombre (`load`, `openCreate`, `setFilter`), no los `set*` crudos. Lo derivado se calcula en el hook o en el render, no se guarda.

### REACT_STATE-05

Compartir con un Context solo cuando hay hijos conectados que lo necesitan (secciones de un formulario, pasos de un asistente). El Context lo crea y provee la unidad; no se crean Contexts globales para el estado de una sola pantalla. Memoizar el valor del Context (`useMemo`) para no re-renderizar a todos los consumidores en cada cambio.

### REACT_STATE-06

No usar `useEffect` para sincronizar estados entre sí; los efectos son para sincronizar con algo externo (API, temporizadores, suscripciones, DOM).

### REACT_STATE-07

Asincronía: toda carga tiene `loading` y `error` visibles. Cancelar o descartar respuestas viejas cuando cambian los filtros o se desmonta la pantalla (`AbortController` con la opción `signal` de axios, o un identificador de petición), para que una respuesta lenta no pise a una más nueva. Toda pantalla nueva nace cancelando sus peticiones.

### REACT_STATE-08

Escrituras: bloquear el doble envío mientras se guarda, recargar o actualizar la lista solo si el guardado fue correcto y mostrar el error si falló, sin perder lo que escribió el usuario.

### REACT_STATE-09

No imponer Redux, Zustand, React Query ni otra librería de estado. Evaluar una solo con aprobación, si el mismo estado del servidor se repite en muchas pantallas con caché e invalidación propias.

### REACT_STATE-10

No guardar secretos ni tokens en estado persistente nuevo. `localStorage` solo para preferencias; la sesión va en una cookie `HttpOnly` cuando el backend lo permite.

### REACT_STATE-11

El estado de una pantalla lo posee su hook; la página lo llama y lo pasa a sus hijos por props (o por Context a los conectados). Un hook de estado nunca importa componentes.

## Procedimiento operativo

1. Listar los `useState` de la pantalla y clasificarlos (-01).
2. Eliminar los derivables y los duplicados de URL o de `AuthContext`.
3. Agrupar en `use<X>Store` lo que cambia junto; definir operaciones.
4. Agregar cancelación y manejo de errores en las cargas.
5. Probar el hook con `renderHook` (operaciones, reset, errores, respuesta vieja descartada) y la página con Testing Library.

## Criterios de aceptación

- **AC-01:** Fuente de verdad y dueño explícitos para cada estado.
- **AC-02:** Sin estado duplicado ni `useEffect` de sincronización interna.
- **AC-03:** Carga, error, cancelación y doble envío controlados.
- **AC-04:** Sin librerías de estado ni Contexts globales injustificados.

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
- Decenas de `useState` sueltos en una página.
- Un Context para evitar pasar dos props.
- `useEffect` que llama a la API sin cancelar ni descartar respuestas viejas.

## Entregables proporcionales

- Implementación o diagnóstico solicitado y sus contratos afectados.
- Explicación breve de decisiones y alternativas significativas.
- Pruebas o validaciones pertinentes y evidencia real.
- Riesgos, bloqueos y decisiones pendientes si los hubiera.

## Relación con otras skills

- **`react-project-structure`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-data-layer`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-forms`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-testing`**: aplicar las reglas pertinentes sin presuponer ejecución automática.

## Resultado esperado

Una solución coherente con las responsabilidades y límites aprobados, comprensible, verificable y proporcional al problema. El informe final debe distinguir **implementado**, **verificado** y **pendiente**.
