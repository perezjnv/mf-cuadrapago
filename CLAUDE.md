# mf-cuadrapago

Frontend de CuadraPago. El repositorio todavía no tiene código: stack, estructura y reglas de UI se
definen con el primer cambio y se documentan aquí.

## Skills React

Todo cambio de frontend sigue las skills `react-*` de `.claude/skills` (adaptadas de las de erpIA el
2026-11-20):

| Si el cambio… | Skill |
|---|---|
| ubica, crea o mueve un archivo | `react-project-structure` |
| crea o modifica un componente, una página o un modal | `react-component-generator`, `react-best-practices` |
| agrega o cambia una ruta | `react-routing` |
| maneja estado de pantalla, cargas o escrituras | `react-state` |
| crea o modifica un formulario | `react-forms` |
| llama a la API o cambia los servicios | `react-data-layer` |
| cambia comportamiento | `react-testing` |
| antes de cada commit | `react-code-review` sobre el diff |
| analiza una página grande o marcado repetido | `react-component-decomposition`, `react-ui-reuse` |

Las skills generales que citan (`software-engineering`, `software-quality`, `code-metrics`,
`mermaid-diagram-style`…) están en el `.claude/skills` del workspace. Si una skill choca con este
archivo, prevalece este archivo y se corrige la skill.

Validar las skills después de editarlas:

```bash
python .claude/skills/react-project-structure/scripts/validate_react_skills.py
```

## Garantías de cada cambio

- Un paso por commit, revertible.
- Mover o cambiar, nunca las dos cosas en el mismo commit.
- El número de pruebas nunca baja.
- Nada se despliega sin pruebas, build y lint en verde y sin aprobación.

## Reglas pendientes de definir

Componentes compartidos obligatorios (tabla, select con búsqueda, modal, confirmación, iconos), dónde
va el título de cada pantalla, convención de respuesta de la API y estructura de pruebas. Las skills
piden definirlas aquí antes de repetirlas en varias pantallas.
