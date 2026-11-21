---
name: react-data-layer
description: >
  Use when crear o modificar servicios de datos de un frontend React: módulos
  axios por dominio en src/services, el cliente api.js, interceptores, contratos
  de respuesta, errores, cancelación y pruebas sin red. Adaptación React de
  SK-015. Follow approved architecture, verified contracts, project conventions
  and controlled autonomy.
---

# SK-015R — React Data Layer

**Versión:** v0.1  
**Estado:** v0.1, adaptada de las skills React de erpIA (2026-11-20); se ajusta con el primer uso en este proyecto  
**Ámbito:** Claude Code · React 18 / JavaScript (JSX), Vite, React Router v6, Vitest  
**Origen:** adaptación de SK-015 `service-generator`

## Objetivo

Acceder a la API desde una sola capa de datos con contratos verificados, errores visibles y sin lógica de pantalla.

## Directrices normativas

### REACT_DATA-01

Un servicio de datos solo habla con la API: no guarda estado de pantalla, no muestra avisos, no abre modales. El estado va en hooks (SK-012R) y la orquestación en `actions/` (SK-008R).

### REACT_DATA-02

Las llamadas pasan por el cliente `services/api.js` (base URL, cabeceras, interceptores). Una página o un componente nunca importa `axios` directamente ni arma URLs con `fetch`.

### REACT_DATA-03

Verificar endpoint, método, parámetros y forma de la respuesta contra el backend (`handler/<dominio>/<recurso>/routes.go` y el modelo Go) antes de implementar. No inventar endpoints.

### REACT_DATA-04

Respetar la convención de respuesta de cada dominio (arreglo directo, `{ data: [] }`, paginado con `total`) tal como la entrega el backend; si difiere entre dominios, documentarla en `CLAUDE.md` y con JSDoc en el servicio. Al unificarla, hacerlo por dominio, con pruebas, en un commit propio.

### REACT_DATA-05

Errores: no ocultarlos devolviendo listas vacías o datos ficticios. El servicio deja pasar el error de axios; la capa que lo muestra decide el mensaje (SK-017R-06).

### REACT_DATA-06

Aceptar `signal` (AbortController) en las listas y búsquedas para que el hook pueda cancelar peticiones viejas (SK-012R-07).

### REACT_DATA-07

Los interceptores son solo para lo transversal (sesión, cabeceras, 401 global); nunca lógica de un dominio. Cambios en `api.js` o en el manejo de sesión son de seguridad y requieren aprobación.

### REACT_DATA-08

Probar servicios con `vi.mock` del cliente `api` (sin red real) y verificar URL, método, parámetros y propagación del error.

### REACT_DATA-09

Ubicación: un archivo por dominio en `src/services/<dominio>.js` (capa de datos global, SK-008R-04), exportando objetos `<recurso>Service` con `list`, `get`, `create`, `update`, `remove` y operaciones propias con nombre del negocio. Los hooks de orquestación no se llaman `*Service`.

### REACT_DATA-10

Seguridad: no poner secretos en variables `VITE_*` (se publican en el JavaScript del sitio); una API key del sitio en `VITE_*` es pública y no protege nada sensible. Nunca registrar en consola tokens, contraseñas ni datos personales.

## Procedimiento operativo

1. Ubicar el endpoint y su modelo en el backend.
2. Agregar o ajustar el servicio en `src/services/<dominio>.js` con JSDoc de la respuesta.
3. Probar con `vi.mock` del cliente.
4. Ejecutar `npx vitest run`.

## Criterios de aceptación

- **AC-01:** Contrato real del backend, documentado.
- **AC-02:** Errores visibles y propagados; sin datos ficticios.
- **AC-03:** Sin `axios` fuera de la capa de datos; sin capas ni APIs inventadas.

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
- `catch` que devuelve `[]` y oculta el error.
- Secretos en variables `VITE_*`.
- Lógica de un dominio dentro de un interceptor.

## Entregables proporcionales

- Implementación o diagnóstico solicitado y sus contratos afectados.
- Explicación breve de decisiones y alternativas significativas.
- Pruebas o validaciones pertinentes y evidencia real.
- Riesgos, bloqueos y decisiones pendientes si los hubiera.

## Relación con otras skills

- **`react-state`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-forms`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-testing`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-code-review`**: aplicar las reglas pertinentes sin presuponer ejecución automática.

## Resultado esperado

Una solución coherente con las responsabilidades y límites aprobados, comprensible, verificable y proporcional al problema. El informe final debe distinguir **implementado**, **verificado** y **pendiente**.
