# Plantilla del informe

En español. Conservar los rangos `archivo:línea` del borrador; cada afirmación sobre el código lleva su
ubicación. Los rangos valen para la fecha del informe: indicarlo.

```markdown
# Descomposición de `<Pagina>`

Estado: propuesta (no implementada). Fecha: <YYYY-MM-DD>.
Ruta: `<ruta>` · Datos: `<Pagina>-descomposicion-<fecha>.json` (salida de inspect-jsx.mjs)

## 1. Resumen
- Condición: **<nivel>** (<n> métricas en Crítico, <n> en Smell).
- 3 a 5 hallazgos principales, con cifra y ubicación.
- Propuesta en una frase: cuántas unidades y qué cambia.

## 2. Condición
| Métrica | Valor | Nivel |
(solo las métricas en Smell o Crítico)

## 3. Smells confirmados
| Smell | Evidencia | Impacto | Unidad que lo resuelve |

Descartados: <señal> — <motivo>.

## 4. Unidades propuestas
| Unidad | Naturaleza | Destino (SK-008R) | Origen | Responsabilidad | Contrato |
(contrato: props y callbacks `on<Evento>`, o las operaciones del hook de estado)

Diagrama (opcional, con `mermaid-diagram-style`): página → hook de estado → vistas y diálogos.

## 5. Plan por pasos
| Paso | Qué | Tipo (mover / cambiar) | Prueba que lo cubre |
Cada paso cierra con pruebas, build y lint en verde.

## 6. Correcciones aparte de la descomposición
`window.confirm`, `catch` vacíos, `key` con índice, `<select>` nativo, iconos locales, `localStorage`.

## 7. Requiere aprobación
Mover a `features/`, cambiar URL, agregar a `components/ui` o `shared/`, cambiar props compartidas.
```
