---
name: react-project-structure
description: >
  Use when organizar o reubicar código de un frontend React (este proyecto y otros
  proyectos React del workspace) por funcionalidades o dominios: dónde va una
  página, un modal, un formulario, un hook de estado, un servicio de datos, un
  catálogo de textos o una prueba. Adaptación React de SK-008
  angular-project-structure. Follow approved architecture, verified contracts,
  project conventions and controlled autonomy.
---

# SK-008R — React Project Structure

**Versión:** v0.2
**Estado:** v0.1, adaptada de las skills React de erpIA (2026-11-20); se ajusta con el primer uso en este proyecto
**Ámbito:** Claude Code · React 18 / JavaScript (JSX), Vite, React Router v6
**Origen:** adaptación de SK-008 `angular-project-structure` v0.18. Mismas preguntas y la misma dirección de dependencias; cambian los mecanismos (hooks, Context y props en vez de inyección, `providers` y signals).

## Objetivo

Organizar el frontend por funcionalidades o dominios para que cada pantalla sea autocontenida, se pueda probar por partes y se migre de a una, sin imponer arquitecturas ni mover lo que no se está tocando.

## Equivalencias con SK-008

| Angular (SK-008) | React (esta skill) |
|---|---|
| `<feature>.routes.ts` con `loadComponent` | `<feature>.routes.jsx` que exporta objetos de ruta con `lazy` (React Router v6.4+) o `React.lazy` |
| Componente standalone `.ts/.html/.scss` | Componente función `.jsx` + `*.module.css` |
| `input()` / `output()` | props de datos y callbacks `on<Evento>` |
| Store con signals en `state/`, provisto en `providers` | hook `use<X>Store` (useReducer/useState) en `state/`; se comparte con hijos conectados mediante un Context que crea la unidad |
| Service de orquestación en `services/` | hook `use<X>Actions` en `actions/` (confirma, avisa, guarda y pide recargar) |
| Service de datos en `core/data-api` | módulo de API del dominio en la capa de datos global (hoy `src/services/<dominio>.js`) |
| `MatDialog` + `MAT_DIALOG_DATA` | modal del proyecto (`Modal`, `ConfirmModal`) con props `open`, `data`, `onClose(result)` |
| Formulario con store y secciones conectadas | `react-hook-form` + esquema `zod`; secciones conectadas con `useFormContext()` |
| `interface` / `type` en `models/interfaces/` | `@typedef` JSDoc en `models/types/` (o `.ts` si el proyecto adopta TypeScript) |
| Guard de ruta | componente envoltorio (`ProtectedRoute`) o `loader` que redirige |
| `*.spec.ts` | `*.test.jsx` / `*.test.js` con Vitest y Testing Library |

## Convenciones del proyecto que prevalecen

Las reglas de UI que defina el `CLAUDE.md` del proyecto (componentes obligatorios, patrones de página, textos de botones) no cambian con esta skill: esta skill solo decide **dónde vive** cada pieza. Si el proyecto usa los dos patrones habituales de un panel de administración, se ubican así:

- CRUD simple en un modal: el formulario del modal es un `dialogs/<x>-dialog/` (o queda en `components/` si es de pocos campos sin estado propio).
- Master-detail como vista que reemplaza la lista: la vista formulario es un `containers/<x>-form-container/` con ruta propia solo si se aprueba darle URL; mientras la vista cambie por estado (`view: 'list' | 'form'`), es un hijo conectado de la página y su formulario va en `forms/<x>-form/`.

Nombres de carpetas en inglés, salvo que el `CLAUDE.md` del proyecto diga otra cosa; los dominios que ya existen con otro idioma se conservan para no romper rutas ni costumbre.

## Directrices normativas

### REACT_PROJECT_STRUCTURE-01

Preferir organización por feature o dominio. En un proyecto nuevo, cada dominio nace como `src/features/<dominio>/`. En uno existente con carpetas por tipo (`pages/`, `components/`), cada dominio pasa a `src/features/<dominio>/` cuando se migra, nunca todos de una vez.

### REACT_PROJECT_STRUCTURE-02

Respetar la convención existente mientras una feature no se migra: `pages/`, `components/ui`, `services/`, `hooks/`, `context/`, `utils/` y `__tests__/` siguen válidos para lo no migrado. No mezclar en una misma feature la estructura vieja y la nueva.

### REACT_PROJECT_STRUCTURE-03

Ubicar páginas, componentes, hooks de estado, acciones, textos y pruebas junto a su funcionalidad.

### REACT_PROJECT_STRUCTURE-04

Capas globales solo con responsabilidad real:

```
src/
├─ app/        → "¿Cómo arranca y se enruta la app?" (main, router raíz, providers globales)
├─ core/       → "¿Qué existe una sola vez?" (sesión/AuthContext, cliente HTTP, layout, ProtectedRoute, capa de datos)
├─ shared/     → "¿Qué se reutiliza sin dominio?" (ui/, hooks/, libs/, icons/, styles/)
└─ features/   → "¿Qué hace la app?" (un dominio por carpeta)
```

En un proyecto que se está migrando, las carpetas viejas equivalen a las nuevas (por ejemplo `components/ui` a `shared/ui`, `services/` a la capa de datos de `core/`, `utils/` a `shared/libs`). Moverlas es un paso aprobado, no un efecto secundario de otro cambio.

### REACT_PROJECT_STRUCTURE-05

No imponer Clean Architecture, hexagonal, Redux ni librerías de estado nuevas. El estado se resuelve con hooks, Context y `react-hook-form`, que el proyecto ya usa (SK-012R `react-state`).

### REACT_PROJECT_STRUCTURE-06

No migrar a TypeScript por defecto. Los tipos se documentan con JSDoc; adoptar TypeScript es una decisión aprobada del proyecto. Si el proyecto ya usa TypeScript, se siguen sus tipos y no JSDoc.

### REACT_PROJECT_STRUCTURE-07

Cargar cada feature de forma diferida (`lazy`) desde el router raíz con un `Suspense` y un estado de carga visible. Una ruta no importa estáticamente páginas de otra feature.

### REACT_PROJECT_STRUCTURE-08

No crear carpetas vacías ni scaffolding sin contenido.

### REACT_PROJECT_STRUCTURE-09

Dentro de una feature que necesite separar sus piezas, organizar por **unidades**: cada **página** (`<x>/`, carpeta kebab-case sin sufijo), cada **container** (`containers/<x>-container/`), cada **modal** (`dialogs/<x>-dialog/`) y cada **formulario** con esquema y secciones (`forms/<x>-form/`). Todas viven en la raíz de la feature y una unidad nunca contiene otra.

Raíz de la feature:

```
features/<feature>/
├─ <feature>.routes.jsx  → "¿Cómo se llega a esta feature?" (única entrada)
├─ <x>/ · <y>/           → "¿Qué pantallas abren sus rutas?"
├─ containers/           → "¿Qué subpáginas con ruta tienen las páginas?"
├─ dialogs/              → "¿Qué procesos se abren en un modal?"
├─ forms/                → "¿Qué formularios con esquema y secciones tiene?"
└─ shared/               → "¿Qué comparten dos o más unidades?" (components/, libs/, mappers/, models/, styles/, state/)
```

Dentro de cada unidad:

```
<unidad>/
├─ <Unidad>Page.jsx | <Unidad>Dialog.jsx | <Unidad>Form.jsx  + <Unidad>.module.css
├─ index.js        → reexporta solo el contrato público de la unidad
├─ components/     → "¿Cómo se ve?" (hijos presentacionales)
├─ state/          → "¿Qué estado tiene?" (use<X>Store.js y su Context si hay hijos conectados)
├─ actions/        → "¿Cómo orquesto confirmaciones, avisos y escrituras?" (use<X>Actions.js)
├─ libs/           → "¿Qué cálculos o reglas puras necesito?" (*.libs.js)
├─ mappers/        → "¿Cómo convierto entre la API y la pantalla?" (*.mapper.js)
├─ models/
│  ├─ types/       → "¿Qué forma tienen los datos?" (*.types.js con @typedef y valores EMPTY_/INITIAL_)
│  ├─ constants/   → "¿Qué valores fijos uso?" (*.constants.js)
│  ├─ enums/       → "¿Qué conjuntos cerrados existen?" (*.enum.js)
│  └─ messages/    → "¿Qué textos le mostramos al usuario?" (*.display.js, *.messages.js)
└─ tests/
```

- **Página (`<x>/`)**: la pantalla que carga una ruta. Llama a su `use<X>Store`, compone sus `components/`, abre modales mediante `use<X>Actions`. Solo la importa `<feature>.routes.jsx`.
- **components/**: en la página son **presentacionales**: reciben props, avisan con callbacks `on<Evento>`, no llaman a la API, no usan el store ni Context de la unidad y no abren modales. Un hijo que necesite el estado de la unidad es **conectado** y vive anidado en la carpeta de la página, fuera de `components/`.
- **dialogs/**: subfeatures autocontenidas sobre `Modal`/`ConfirmModal`. Contrato público: el componente y sus props `{ open, data, onClose }`; `onClose(result)` con un resultado o sin argumento si se canceló (Esc, fondo, botón). Lo que solo usa el modal vive dentro de él; con un segundo consumidor, sube a `shared/` de la feature.
- **forms/**: un formulario con esquema `zod` y secciones. `schema.js` define validaciones y mensajes; `use<X>Form.js` crea el `useForm` con `zodResolver`; el contenedor lo envuelve en `FormProvider` y las secciones (`components/<seccion>/`) usan `useFormContext()`. Un formulario de pocos campos sin secciones no es unidad: queda en `components/` de quien lo usa. Las reglas viven en el esquema o en `libs/`, no en las secciones.
- **state/**: `use<X>Store` guarda qué se muestra, si está cargando, el filtro y la paginación, y las operaciones que lo cambian. Es la fuente de verdad de la unidad. Si un hijo conectado lo necesita, la unidad crea `<X>StoreContext` en el mismo archivo y lo provee en su raíz.
- **actions/**: hooks de orquestación: piden confirmación, llaman a la capa de datos, muestran el aviso y piden recargar al store. No contienen marcado.
- **mappers/** y **libs/**: funciones puras sin React (sin hooks ni JSX).
- **models/**: solo datos y JSDoc, sin React ni llamadas a la API. Los conjuntos cerrados se declaran `Object.freeze([...])` y su catálogo de presentación `<CONCEPTO>_DISPLAY` cubre cada valor en un solo objeto (prohibidos los mapas paralelos `X_LABELS` + `X_COLORS`). Los textos que genera el código (errores, validaciones, avisos) van en `*.messages.js`; los textos fijos del JSX se quedan en el JSX.
- **`index.js`**: cada unidad expone solo su contrato (página, modal y su resultado, formulario y sus secciones). Fuera de la unidad se importa desde `index.js`, nunca desde sus carpetas internas.

Una feature pequeña puede quedarse plana: la estructura se adopta cuando hay varios componentes, modales o archivos de apoyo.

### REACT_PROJECT_STRUCTURE-10

Nombres: componentes y hooks en PascalCase / camelCase (`ComprasPage.jsx`, `useComprasStore.js`), carpetas en kebab-case (`compras/`, `anular-compra-dialog/`), sufijos `*.libs.js`, `*.mapper.js`, `*.types.js`, `*.constants.js`, `*.enum.js`, `*.display.js`, `*.messages.js`, `*.module.css`, `*.test.jsx`. Dentro de una feature no usar `utils/`, `helpers/` ni `pages/`.

### REACT_PROJECT_STRUCTURE-11

Las dependencias van en una sola dirección:

```
Component → Page / Container / Dialog → use<X>Store / use<X>Actions → capa de datos → Backend
```

| Naturaleza | Qué puede hacer | Carpeta |
|---|---|---|
| Presentacional | Solo props y callbacks | `components/` de una unidad, `shared/ui` |
| Contenedor | Usa su store y sus acciones, llama a la capa de datos a través de ellos | `<x>/`, `containers/<x>-container/`, `dialogs/<x>-dialog/` |
| Conectado | Hijo privado que lee el Context de la unidad | anidado en la unidad, fuera de `components/` |
| Sección de formulario | Usa `useFormContext()` del formulario | `forms/<x>-form/components/` |

Un store nunca importa componentes; un componente presentacional nunca importa `services/`, `axios`, stores ni modales. Cuando el proyecto tenga ESLint, hacerlo cumplir con `no-restricted-imports` por carpeta.

### REACT_PROJECT_STRUCTURE-12

Ubicación según consumidores: cada archivo vive en el ancestro común más cercano de quienes lo usan. Una sola unidad → dentro de ella; dos unidades de la feature → `shared/` de la feature; dos features → `core/` (si existe una vez en la app) o `shared/` (si es reutilizable sin dominio). Una feature puede usar otra completa (su ruta), nunca una pieza suelta, y sin ciclos. No subir algo por mera semejanza: repetir dos iconos no justifica un componente; repetirlos en 80 páginas, sí.

### REACT_PROJECT_STRUCTURE-13

Las pruebas de una feature migrada viven en `tests/` dentro de la carpeta de lo que prueban e importan con `../`. Lo no migrado conserva `src/__tests__/<dominio>/`. Al migrar una feature, sus pruebas se mueven con ella y se verifica que el conteo de pruebas no baja.

### REACT_PROJECT_STRUCTURE-14

Antes de crear o refactorizar una interfaz, identificar qué responsabilidades aplican (Layout, Page, Container, Component, Dialog). No crear unidades solo para clasificar: un container existe solo si la subpágina tiene ruta propia; un drawer o popover no es un Dialog.

## Procedimiento operativo

1. Medir la feature (archivos, líneas, `useState`, modales, pruebas) y ejecutar sus pruebas como línea base.
2. Mapear pantallas, modales, formularios y consumidores de cada archivo.
3. Proponer el árbol mínimo y pedir aprobación si cambia rutas, contratos o capas globales.
4. Mover sin cambiar comportamiento; refactorizar internamente después, en un paso separado.
5. Verificar: pruebas (mismo número o más), `vite build`, y que la ruta carga de forma diferida.

## Criterios de aceptación

- **AC-01:** Cada artefacto vive donde está su dueño y sus consumidores (-12).
- **AC-02:** Sin carpetas vacías ni duplicados globales.
- **AC-03:** Lo no migrado sigue funcionando sin cambios (-02).
- **AC-04:** Dependencias en una sola dirección (-11); `components/` de la página solo presentacionales.
- **AC-05:** La feature entra por `<feature>.routes.jsx` con carga diferida (-07).
- **AC-06:** Pruebas en `tests/` de lo que prueban y sin pérdida de cobertura (-13).

## Política de autonomía y verificación

Hereda **SK-001 `software-engineering`** y **SK-003 `software-quality`**. Claude puede mover y refactorizar dentro de una feature aprobada; requiere aprobación antes de cambiar las capas globales (`app/`, `core/`, `shared/`), las URL, el manejo de sesión o de seguridad, o de introducir dependencias. Resultados con `PASSED`, `PASSED_WITH_OBSERVATIONS`, `FAILED`, `BLOCKED` o `NOT_VERIFIED`, informando los comandos realmente ejecutados.

## Antipatrones

- Migrar varias features en un mismo cambio o mezclar mover con reescribir.
- Context global para estado de una sola pantalla.
- Componentes presentacionales que llaman a la API.
- Carpetas creadas por plantilla sin contenido.
- Bajar el número de pruebas al mover archivos.

## Relación con otras skills

- **SK-008 `angular-project-structure`**: fuente de esta adaptación; ante una duda de criterio no resuelta aquí, aplicar su razonamiento con los mecanismos de React.
- **SK-005 `modular-design`**, **SK-006 `dependency-management`**, **SK-025 `atomic-design`**: reglas agnósticas aplicables.
- **`react-component-generator`** (SK-014R), **`react-state`** (SK-012R/018R), **`react-forms`** (SK-017R), **`react-routing`** (SK-011R), **`react-data-layer`** (SK-015R), **`react-testing`** (SK-020R/021R): cómo se construye cada pieza que esta skill ubica.
- **`react-best-practices`** (SK-009R) y **`react-code-review`** (SK-022R): calidad y revisión.
- **`code-metrics`**: medición antes y después de cada fase.
