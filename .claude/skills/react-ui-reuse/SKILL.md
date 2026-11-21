---
name: react-ui-reuse
description: >
  Use when el usuario pide analizar, rastrear, clasificar o justificar la centralización de elementos
  de interfaz en un frontend React (JSX): botones, tablas, campos, selects, modales, mensajes, iconos o
  cualquier bloque de JSX repetido entre páginas que pueda ser un componente reutilizable. Mide la
  adopción de components/ui y shared/icons, agrupa bloques con la misma estructura y decide con
  evidencia si conviene migrar a un componente existente, ampliarlo, crear uno nuevo o dejarlo local.
  Solo analiza: no crea ni modifica componentes. Adaptación React de refactor-ui-reuse.
argument-hint: "--discover | --adoption | --family nombre | --example archivo:inicio-fin [--scope ruta]"
allowed-tools: Bash(node .claude/skills/react-ui-reuse/scripts/ui-reuse-jsx.mjs:*), Bash(ls:*), Bash(mkdir:*), Bash(grep:*), Read, Write
---

# SK-027R — React UI Reuse

**Versión:** v0.1  
**Estado:** v0.1, adaptada de las skills React de erpIA (2026-11-20); se ajusta con el primer uso en este proyecto  
**Ámbito:** Claude Code · React 18 / JavaScript (JSX), Vite, React Router v6, Vitest  
**Origen:** adaptación de `refactor-ui-reuse` (su script lee plantillas Angular; este lee JSX)

## Objetivo

Encontrar con evidencia el marcado JSX repetido entre páginas y decidir qué hacer con cada grupo,
usando primero lo que ya existe en la UI compartida del proyecto (`src/shared/ui` o `src/components/ui`).

## Directrices normativas

### REACT_UI_REUSE-01

Esta skill **solo analiza**. Crear un componente o migrar páginas corresponde a
`react-component-generator` y requiere aprobación.

### REACT_UI_REUSE-02

Lo medible lo mide el script (`scripts/ui-reuse-jsx.mjs`): no contar usos ni agrupar a mano.

### REACT_UI_REUSE-03

Propósito antes que forma: dos bloques con la misma estructura y distinto propósito no son el mismo
componente. Leer al menos tres usos de cada grupo antes de decidir.

### REACT_UI_REUSE-04

Las cuatro salidas, en orden: migrar a un componente existente de la UI compartida; ampliar
uno existente (cambia un contrato público, requiere aprobación, citar cuántos usos afecta); crear uno
nuevo (requiere aprobación y al menos dos consumidores reales, SK-014R-08); o dejarlo local.

### REACT_UI_REUSE-05

Las reglas del `CLAUDE.md` del proyecto deciden sin análisis de costo (por ejemplo, qué componente se
usa para un select con FK, para eliminar o para los iconos de acción). El análisis solo prioriza el
orden de migración. Si el proyecto no las tiene, el informe las propone como decisión a aprobar.

### REACT_UI_REUSE-06

La migración de los consumidores sigue las garantías de cambio seguro: una página por commit, con
prueba de la página antes de tocarla.

## Pasos

### 1. Elegir el modo

Desde la raíz del proyecto React (donde está `package.json`):

| Pedido | Comando |
|---|---|
| "¿Qué se repite?" | `node .claude/skills/react-ui-reuse/scripts/ui-reuse-jsx.mjs --discover` |
| "¿Cuánto se usan los compartidos?" | `node .claude/skills/react-ui-reuse/scripts/ui-reuse-jsx.mjs --adoption` |
| "¿Dónde está esta familia?" | `node .claude/skills/react-ui-reuse/scripts/ui-reuse-jsx.mjs --family select-nativo,tabla-propia` |
| "¿Este bloque se repite?" | `node .claude/skills/react-ui-reuse/scripts/ui-reuse-jsx.mjs --example src/pages/<x>.jsx:<inicio>-<fin>` |

Opciones: `--scope src/pages/<dominio>`, `--threshold 0.75` (similitud para `--example`), `--min-nodes 8`
y `--min-files 3` (para `--discover`), `--json salida.json`. Familias: `boton-primario`, `boton-icono`,
`select-nativo`, `tabla-propia`, `campo-con-label`, `modal`, `tabla-datos`, `searchable-select`, `alerta`.

### 2. Leer el código

Para cada grupo del borrador, leer el ejemplo y al menos tres usos. Escribir en una frase el propósito
de cada uso; si el grupo mezcla propósitos, dividirlo.

### 3. Decidir y escribir el informe

Aplicar REACT_UI_REUSE-04 y -05. Informe en `docs/frontend-react/reuse/<tema>-<YYYY-MM-DD>.md` con:
grupo, propósito, usos (`archivo:líneas`), salida elegida, contrato propuesto si se crea o amplía, y
orden de migración (primero las páginas con prueba).

## Criterios de aceptación

- **AC-01:** El borrador se generó con el script y el informe cita su comando.
- **AC-02:** Cada decisión cita al menos tres usos leídos (o todos, si son menos).
- **AC-03:** Lo que requiere aprobación (ampliar o crear compartidos) está listado con los usos afectados.
- **AC-04:** No se modificó código del proyecto.

## Política de autonomía y verificación

Esta skill hereda **SK-001 `software-engineering`**. Solo escribe el informe. La evidencia se rige por
**SK-003 `software-quality`**: informar los comandos ejecutados y sus resultados.

Todo cambio respeta las garantías de cambio seguro (si el proyecto tiene un roadmap o un `CLAUDE.md` con reglas propias, se suman): un paso por commit revertible, mover o cambiar pero nunca ambas cosas, y las pruebas nunca bajan.

## Límites conocidos

- La huella de `--discover` es estructural (etiquetas por profundidad y clases): no ve textos ni
  valores, así que agrupa bloques de distinto propósito con la misma forma. Por eso se lee el código.
- Las familias se detectan por etiqueta y nombre de clase (`btnPrimary`, `iconBtn`, `formGroup`); una
  clase con otro nombre no se cuenta.
- `--adoption` cuenta archivos que importan desde `components/ui` o `shared/`, no usos dentro del archivo.
- Las familias usan nombres de clase de erpIA (`btnPrimary`, `iconBtn`, `formGroup`, `alertError`); si el proyecto usa otros, ajustar `FAMILIES` en el script.
- `<select>` nativo cuenta también selects de pocas opciones fijas, que `CLAUDE.md` permite: confirmar leyendo.

## Antipatrones que deben evitarse

- Crear un componente compartido por coincidencia de forma sin comparar propósitos.
- Ampliar un componente compartido con una prop por cada variante encontrada.
- Migrar todas las páginas de una familia en un solo commit.
- Inventar usos, cifras o resultados.

## Relación con otras skills

- **`react-component-decomposition`**: usa `--example` para saber si un bloque se repite fuera de la página.
- **`react-component-generator`**: implementa la decisión (SK-014R-11, tabla de reutilización).
- **`react-project-structure`**: ubicación del componente nuevo (SK-008R-04/12).
- **`atomic-design`**: guía conceptual para piezas reutilizables, sin carpetas obligatorias.

## Resultado esperado

Un informe que dice qué marcado repetido existe, qué componente del proyecto debe usarse en cada caso
y en qué orden migrar, con evidencia verificable y lo que requiere aprobación.
