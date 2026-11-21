---
name: react-testing
description: >
  Use when diseñar, escribir o ejecutar pruebas de un frontend React con Vitest
  y Testing Library: componentes, hooks, servicios, formularios, rutas y flujos
  de página, sin red real y con evidencia honesta. Adaptación React de SK-020 y
  SK-021. Follow approved architecture, verified contracts, project conventions
  and controlled autonomy.
---

# SK-020R / SK-021R — React Testing

**Versión:** v0.1  
**Estado:** v0.1, adaptada de las skills React de erpIA (2026-11-20); se ajusta con el primer uso en este proyecto  
**Ámbito:** Claude Code · React 18 / JavaScript (JSX), Vite, React Router v6, Vitest  
**Origen:** adaptación de SK-020 `unit-testing` y SK-021 `integration-testing`

## Objetivo

Probar el comportamiento visible y los contratos de cada pieza con pruebas deterministas y evidencia real de ejecución.

## Directrices normativas

### REACT_TESTING-01

Usar el runner existente: Vitest con jsdom, Testing Library y `jest-dom` (`src/__tests__/setup.js`). No migrar a otro runner ni agregar librerías de prueba (MSW, Playwright) sin aprobación.

### REACT_TESTING-02

Priorizar por riesgo: caminos principales, límites, errores, permisos y contratos con el backend.

### REACT_TESTING-03

Aislar red, reloj y almacenamiento: `vi.mock` de los servicios de `src/services/*`, `vi.useFakeTimers` cuando hay tiempo, `localStorage` limpio entre pruebas. Ninguna prueba llama al backend real.

### REACT_TESTING-04

Probar como lo usa una persona: buscar por rol, etiqueta o texto (`getByRole`, `getByLabelText`, `findByText`), interactuar con eventos y comprobar lo que aparece. No probar estado interno ni detalles de implementación.

### REACT_TESTING-05

Cubrir según la unidad: componente (render, props, callbacks), hook de estado (`renderHook`: operaciones, errores, respuesta vieja descartada), servicio (URL, método, propagación del error), formulario (validaciones, error del servidor, doble envío, cuerpo enviado), modal (abrir, cancelar, resultado) y página (flujo listar, crear, editar y eliminar con los servicios simulados).

### REACT_TESTING-06

Pruebas de integración: los participantes reales de la pantalla (página, hooks, componentes y UI compartida) y solo lo externo simulado (servicios y sesión). No simular todos los participantes del flujo que se quiere probar.

### REACT_TESTING-07

Convenciones de prueba del `CLAUDE.md` del proyecto. En general: envolver en `MemoryRouter` lo que usa el router, simular la sesión con el contexto que la página espera (usuario, empresa activa) y simular cada servicio con la forma real que devuelve el backend.

### REACT_TESTING-08

Evitar esperas arbitrarias, pruebas que dependen del orden, mocks excesivos y aserciones vacías. Usar `findBy*` o `waitFor` para lo asíncrono.

### REACT_TESTING-09

La cobertura no es corrección; no bajar umbrales existentes. El número de pruebas nunca baja.

### REACT_TESTING-10

Ubicación: en una feature migrada, las pruebas viven en `tests/` junto a lo que prueban (SK-008R-13); si el proyecto ya centraliza sus pruebas (por ejemplo `src/__tests__/`), lo no migrado las conserva ahí. Al mover pruebas, comparar el total antes y después.

### REACT_TESTING-11

Registrar comandos y resultados reales (`npx vitest run`: archivos y pruebas que pasan) con los estados de SK-003; no afirmar ejecuciones que no ocurrieron.

### REACT_TESTING-12

Prueba de humo de rutas: toda ruta de la app monta su página sin errores. Se actualiza cada vez que se agrega, mueve o difiere una ruta.

## Procedimiento operativo

1. Identificar la unidad y sus riesgos.
2. Definir qué se simula y qué participa de verdad.
3. Escribir las pruebas por comportamiento.
4. Ejecutar `npx vitest run` (y `--coverage` si se mide) y reportar.

## Criterios de aceptación

- **AC-01:** Pruebas deterministas y observables.
- **AC-02:** Sin red ni credenciales reales.
- **AC-03:** Evidencia fiel de ejecución, con el total de pruebas.
- **AC-04:** Pruebas ubicadas según SK-008R-13.

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
- `setTimeout` para esperar renders.
- Probar que se llamó a un `setState`.
- Mover pruebas y perder algunas sin notarlo.

## Entregables proporcionales

- Implementación o diagnóstico solicitado y sus contratos afectados.
- Explicación breve de decisiones y alternativas significativas.
- Pruebas o validaciones pertinentes y evidencia real.
- Riesgos, bloqueos y decisiones pendientes si los hubiera.

## Relación con otras skills

- **`software-quality`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-component-generator`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-state`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-forms`**: aplicar las reglas pertinentes sin presuponer ejecución automática.

## Resultado esperado

Una solución coherente con las responsabilidades y límites aprobados, comprensible, verificable y proporcional al problema. El informe final debe distinguir **implementado**, **verificado** y **pendiente**.
