---
name: react-forms
description: >
  Use when crear o modificar formularios React: formularios controlados con
  useState o react-hook-form, validación con zod, mensajes accesibles, errores
  del servidor, envío sin duplicados y formularios dentro de modales. Adaptación
  React de SK-017. Follow approved architecture, verified contracts, project
  conventions and controlled autonomy.
---

# SK-017R — React Forms

**Versión:** v0.1  
**Estado:** v0.1, adaptada de las skills React de erpIA (2026-11-20); se ajusta con el primer uso en este proyecto  
**Ámbito:** Claude Code · React 18 / JavaScript (JSX), Vite, React Router v6, Vitest  
**Origen:** adaptación de SK-017 `form-generator`

## Objetivo

Crear formularios accesibles, con validaciones confirmadas, estados claros y envíos seguros.

## Directrices normativas

### REACT_FORMS-01

Examinar la estrategia del formulario existente antes de cambiarla (controlados con `useState`, `react-hook-form` u otra) y las versiones instaladas de `react-hook-form`, `zod` y `@hookform/resolvers`. Con zod 4, los mensajes van en `{ message }` (no `errorMap` ni `invalid_type_error`, que son de zod 3).

### REACT_FORMS-02

Formularios nuevos con varias validaciones o secciones: `react-hook-form` con esquema `zod` y `zodResolver`, en `forms/<x>-form/` (SK-008R-09). Formularios de pocos campos: controlados con `useState` está bien. No migrar formularios existentes de forma masiva: se migra uno cuando se toca por otra razón y con pruebas.

### REACT_FORMS-03

No inventar obligatoriedad, formatos, longitudes ni reglas de negocio: tomarlas del backend (`validate:"required"` en los modelos Go, reglas del usecase) o de un requisito confirmado. Para RUT usar `utils/rutValidator.js`, no una expresión nueva.

### REACT_FORMS-04

Distinguir el estado del formulario del cuerpo que se envía: convertir en un mapper (`toCreateRequest`) los tipos (números, fechas `YYYY-MM-DD`, vacíos a `null`) y quitar campos internos como `_key`. No enviar campos que el backend no espera.

### REACT_FORMS-05

Cada campo con `<label htmlFor>`, mensaje de error junto al campo asociado con `aria-describedby` y `aria-invalid`, y foco en el primer campo con error al fallar el envío.

### REACT_FORMS-06

Distinguir errores de validación local de errores del servidor: un 400/409/422 con mensaje se muestra en el campo o arriba del formulario; un 500 muestra un mensaje genérico y no el texto técnico de la respuesta.

### REACT_FORMS-07

Controlar el envío: botón deshabilitado y con indicador mientras guarda, sin doble envío, y los datos del usuario se conservan si falla.

### REACT_FORMS-08

El frontend no es la fuente de seguridad ni de autorización: el backend valida todo de nuevo. No ocultar un campo como forma de impedir que se modifique.

### REACT_FORMS-09

En un formulario dentro de un modal, el modal es dueño del envío: mientras envía bloquea el cierre y el doble envío, cierra con `onClose(result)` solo si el envío fue correcto y, si falla, queda abierto mostrando el error (SK-014R-10).

### REACT_FORMS-10

Reglas del `CLAUDE.md` del proyecto (por ejemplo, qué select usar con FK). En general: selects encadenados con el segundo `disabled` hasta elegir el primero, CRUD simple en modal y master-detail en vista propia con totales calculados en el render.

## Procedimiento operativo

1. Revisar el contrato del backend (modelo Go del request, validaciones del usecase).
2. Elegir estrategia (-02) y ubicación (SK-008R).
3. Implementar campos, esquema, mapper y envío.
4. Probar: validaciones, error del servidor, doble envío, cierre del modal y valores enviados.

## Criterios de aceptación

- **AC-01:** Validaciones y campos según el contrato real del backend.
- **AC-02:** Formulario accesible: etiquetas, errores asociados y foco.
- **AC-03:** Envío, errores y doble envío controlados.

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
- Validaciones distintas a las del backend.
- Mostrar al usuario el mensaje técnico de un error 500.
- Migrar todos los formularios a `react-hook-form` en un solo cambio.

## Entregables proporcionales

- Implementación o diagnóstico solicitado y sus contratos afectados.
- Explicación breve de decisiones y alternativas significativas.
- Pruebas o validaciones pertinentes y evidencia real.
- Riesgos, bloqueos y decisiones pendientes si los hubiera.

## Relación con otras skills

- **`react-component-generator`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-state`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-data-layer`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-testing`**: aplicar las reglas pertinentes sin presuponer ejecución automática.

## Resultado esperado

Una solución coherente con las responsabilidades y límites aprobados, comprensible, verificable y proporcional al problema. El informe final debe distinguir **implementado**, **verificado** y **pendiente**.
