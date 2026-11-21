---
name: react-best-practices
description: >
  Use when implementar React idiomático, seguro, accesible y eficiente según la
  versión instalada: reglas de hooks, efectos, keys, error boundaries,
  rendimiento medido, sanitización y superficies superpuestas. Adaptación React
  de SK-009. Follow approved architecture, verified contracts, project
  conventions and controlled autonomy.
---

# SK-009R — React Best Practices

**Versión:** v0.1  
**Estado:** v0.1, adaptada de las skills React de erpIA (2026-11-20); se ajusta con el primer uso en este proyecto  
**Ámbito:** Claude Code · React 18 / JavaScript (JSX), Vite, React Router v6, Vitest  
**Origen:** adaptación de SK-009 `angular-best-practices`

## Objetivo

Implementar React idiomático, reactivo, seguro y accesible de acuerdo con la versión y las convenciones del proyecto.

## Directrices normativas

### REACT_BEST_PRACTICES-01

Comprobar la versión instalada (`package.json`: React 18.2, React Router 6.21) antes de usar una API; no usar APIs de React 19 ni de versiones de React Router no instaladas.

### REACT_BEST_PRACTICES-02

Componentes función y hooks para código nuevo. Respetar las reglas de los hooks: solo en el nivel superior y en componentes o hooks propios, nunca en condiciones o bucles.

### REACT_BEST_PRACTICES-03

Efectos solo para sincronizar con algo externo. Toda dependencia usada va en el arreglo de dependencias (sin desactivar `react-hooks/exhaustive-deps` salvo con un comentario que lo justifique) y todo efecto que suscribe, programa o pide datos devuelve su limpieza.

### REACT_BEST_PRACTICES-04

Manipular el DOM solo con `ref` y cuando React no lo resuelve (foco, medidas, librerías como Leaflet). `createPortal` para menús y desplegables que deben salir de un contenedor con overflow.

### REACT_BEST_PRACTICES-05

Keys estables del dato en las listas (SK-014R-04). No definir componentes dentro de otros componentes.

### REACT_BEST_PRACTICES-06

Rendimiento proporcional: medir antes de optimizar. `useMemo`/`useCallback`/`memo` solo cuando hay un costo medido o una referencia estable necesaria (dependencia de un efecto, valor de Context). La carga diferida por feature (SK-011R) suele ser la optimización de mayor impacto en un panel con muchas pantallas.

### REACT_BEST_PRACTICES-07

Error boundaries: al menos uno sobre el área de contenido y uno por ruta diferida, para que un error de render no deje la pantalla en blanco.

### REACT_BEST_PRACTICES-08

Seguridad en el render: React escapa el texto; no usar `dangerouslySetInnerHTML` ni `react-markdown` con HTML crudo (`rehype-raw`) sin sanitizar. No construir `href` o `src` con datos del usuario sin validar el esquema (`javascript:`). No guardar tokens ni secretos en `localStorage` nuevo.

### REACT_BEST_PRACTICES-09

Superficies superpuestas con la infraestructura existente (`Modal`, `ConfirmModal`); no agregar una librería solo para un diálogo. Un modal bloquea el fondo y retiene el foco; un menú, popover o panel lateral no modal no se implementa como modal.

### REACT_BEST_PRACTICES-10

Accesibilidad en cada cambio: roles, nombres accesibles, teclado y contraste (SK-014R-07).

## Procedimiento operativo

1. Revisar versión y convenciones del proyecto.
2. Implementar respetando hooks, efectos y keys.
3. Revisar seguridad del render y accesibilidad.
4. Verificar con pruebas, build y ESLint si ya está configurado.

## Criterios de aceptación

- **AC-01:** APIs compatibles con la versión instalada y convenciones respetadas.
- **AC-02:** Efectos con dependencias completas y limpieza.
- **AC-03:** Render seguro y accesibilidad relevante verificada.

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
- Desactivar `exhaustive-deps` para silenciar un aviso.
- `useMemo` en todo por costumbre.
- HTML del usuario insertado sin sanitizar.

## Entregables proporcionales

- Implementación o diagnóstico solicitado y sus contratos afectados.
- Explicación breve de decisiones y alternativas significativas.
- Pruebas o validaciones pertinentes y evidencia real.
- Riesgos, bloqueos y decisiones pendientes si los hubiera.

## Relación con otras skills

- **`react-component-generator`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-state`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-routing`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-code-review`**: aplicar las reglas pertinentes sin presuponer ejecución automática.

## Resultado esperado

Una solución coherente con las responsabilidades y límites aprobados, comprensible, verificable y proporcional al problema. El informe final debe distinguir **implementado**, **verificado** y **pendiente**.
