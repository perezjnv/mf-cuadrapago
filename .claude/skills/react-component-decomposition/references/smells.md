# Smells de componentes React

Cada smell se confirma leyendo el código en los rangos del borrador. Se reporta con `archivo:líneas`,
impacto y la unidad que lo resuelve. Si la lectura no lo confirma, se menciona como descartado.

| Smell | Señal del borrador | Cómo confirmarlo | Resolución habitual |
|---|---|---|---|
| **Página que hace todo** | `componentLines`, `useState`, `functions` altos | La página carga datos, maneja lista, filtros, formulario y modales a la vez | `use<X>Store` (SK-012R-03/04) + vistas o diálogos como unidades |
| **Varias vistas en un componente** | `modeSwitches ≥ 1`, regiones `modo` | Un `if (view === …) return` o ternario alterna pantallas completas | Una unidad por vista (Patrón B: lista y formulario); la página coordina |
| **Modales acumulados** | `modals ≥ 3` | Cada modal es un proceso con estado propio | `dialogs/<x>-dialog/` con contrato `open`/`data`/`onClose(result)` (SK-014R-10) |
| **Overlay propio** | `customOverlays ≥ 1` | `div` con `position: fixed; inset: 0` hace de modal | `Modal` de `components/ui` (SK-014R-09) |
| **Estado hub** | Tabla de hubs | Un estado (`form`, `editing`, `detalles`) lo tocan casi todas las funciones | Extraerlo primero a su hook o a `react-hook-form` (SK-017R-02) |
| **Función larga o compleja** | `maxFunctionLines`, `maxComplexity` | Mezcla validación, transformación, llamada a la API y avisos | Validación y transformación a `libs/` o `mappers/` (puras, con prueba); la llamada en el hook |
| **Render en funciones** | Función larga que devuelve JSX | `renderTabla()` o `renderDetalle()` dentro de la página | Componente propio en `components/` con props explícitas |
| **Componente anidado** | `nestedComponents ≥ 1` | `function Fila()` definida dentro de la página | Moverlo afuera: se recrea en cada render y pierde su estado (SK-009R-05) |
| **Bloques duplicados** | Sección Duplicados | Dos regiones o funciones casi iguales | Un componente o una función de `libs/` con parámetros |
| **Efectos que sincronizan estado** | Efectos sin servicio que solo llaman setters | `useEffect` copia o deriva estado | Calcular en el render o en el handler (SK-012R-06) |
| **Errores tragados** | `catch` vacío | El error no se muestra ni se registra | Error visible en la página (SK-015R-05, SK-012R-07) |

Los incumplimientos de reglas que no son de estructura (`window.confirm`, `key` con índice, `<select>`
nativo, iconos locales, `localStorage`) se listan en el informe como correcciones aparte de
la descomposición.
