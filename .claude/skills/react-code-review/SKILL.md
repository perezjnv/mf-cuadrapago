---
name: react-code-review
description: >
  Use when revisar cambios de un frontend React (JSX/JS) con hallazgos precisos,
  severidad y evidencia: corrección, hooks, estado, asincronía, seguridad,
  accesibilidad, rendimiento, estructura según SK-008R y calidad de las pruebas.
  Adaptación React de SK-022. Follow approved architecture, verified contracts,
  project conventions and controlled autonomy.
---

# SK-022R — React Code Review

**Versión:** v0.1  
**Estado:** v0.1, adaptada de las skills React de erpIA (2026-11-20); se ajusta con el primer uso en este proyecto  
**Ámbito:** Claude Code · React 18 / JavaScript (JSX), Vite, React Router v6, Vitest  
**Origen:** adaptación de SK-022 `angular-code-review`

## Objetivo

Revisar cambios React con hallazgos accionables, sustentados en evidencia y separados de las preferencias.

## Directrices normativas

### REACT_CODE_REVIEW-01

Determinar el diff, el requisito, el paso del plan al que pertenece (si hay uno) y las convenciones (`CLAUDE.md`, SK-008R) antes de revisar.

### REACT_CODE_REVIEW-02

Verificar corrección: reglas de los hooks, dependencias de efectos, limpieza, cierres con valores viejos (stale closures), keys, nulos e indefinidos (`res.data` vs arreglo según el dominio), conversión de tipos al enviar y regresiones de comportamiento.

### REACT_CODE_REVIEW-03

Asincronía: carreras entre respuestas, falta de cancelación al desmontar o al cambiar filtros, doble envío, errores tragados en `catch`.

### REACT_CODE_REVIEW-04

Seguridad: `dangerouslySetInnerHTML` o markdown con HTML crudo, URLs construidas con datos del usuario, secretos en `VITE_*`, tokens o datos personales en `localStorage` o en `console.log`, mensajes técnicos del backend mostrados al usuario, controles de acceso solo en el frontend.

### REACT_CODE_REVIEW-05

Accesibilidad: etiquetas, nombres de botones de ícono, foco y teclado en modales, errores asociados a sus campos.

### REACT_CODE_REVIEW-06

Estructura y dependencias según SK-008R: componentes presentacionales sin API ni stores, `axios` fuera de la capa de datos, imports de piezas internas de otra feature o de otra unidad, mezcla de mover y cambiar en un mismo commit.

### REACT_CODE_REVIEW-07

Pruebas: que existan para el comportamiento cambiado, que se hayan ejecutado y que el total no baje.

### REACT_CODE_REVIEW-08

Distinguir defectos comprobados de riesgos potenciales y de preferencias de estilo.

### REACT_CODE_REVIEW-09

Cada hallazgo con archivo y línea, evidencia, impacto, severidad y corrección propuesta.

### REACT_CODE_REVIEW-10

Severidad por impacto: CRITICAL (fuga de datos o de credenciales, pérdida de datos), HIGH (función rota, autorización eludible), MEDIUM (error en un caso límite, accesibilidad bloqueante), LOW (mantenibilidad), INFO (sugerencia).

### REACT_CODE_REVIEW-11

Si se pide solo revisión, no editar.

### REACT_CODE_REVIEW-12

No marcar pruebas como pasadas sin ejecutarlas; si no se pudieron ejecutar, decir por qué.

## Procedimiento operativo

1. Leer el diff completo y el contexto de cada archivo tocado.
2. Ejecutar `npx vitest run` y `npx vite build` si el alcance lo permite.
3. Revisar con la lista de -02 a -07.
4. Reportar hallazgos ordenados por severidad, con estado de revisión SK-003.

## Criterios de aceptación

- **AC-01:** Cada hallazgo es accionable y está sustentado.
- **AC-02:** No se confunde preferencia con defecto.
- **AC-03:** El estado de la revisión es honesto, incluido lo que no se pudo verificar.

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
- Hallazgos sin ubicación ni evidencia.
- Reescribir el código del autor durante una revisión.

## Entregables proporcionales

- Implementación o diagnóstico solicitado y sus contratos afectados.
- Explicación breve de decisiones y alternativas significativas.
- Pruebas o validaciones pertinentes y evidencia real.
- Riesgos, bloqueos y decisiones pendientes si los hubiera.

## Relación con otras skills

- **`react-best-practices`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-project-structure`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-testing`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`software-quality`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`dependency-management`**: aplicar las reglas pertinentes sin presuponer ejecución automática.

## Resultado esperado

Una solución coherente con las responsabilidades y límites aprobados, comprensible, verificable y proporcional al problema. El informe final debe distinguir **implementado**, **verificado** y **pendiente**.
