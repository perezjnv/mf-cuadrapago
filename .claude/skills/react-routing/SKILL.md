---
name: react-routing
description: >
  Use when diseñar o modificar rutas de un frontend React con React Router v6:
  rutas por feature, carga diferida con React.lazy y Suspense,
  ProtectedRoute/PermissionRoute, parámetros, redirecciones y errores de carga.
  Adaptación React de SK-011. Follow approved architecture, verified contracts,
  project conventions and controlled autonomy.
---

# SK-011R — React Routing

**Versión:** v0.1  
**Estado:** v0.1, adaptada de las skills React de erpIA (2026-11-20); se ajusta con el primer uso en este proyecto  
**Ámbito:** Claude Code · React 18 / JavaScript (JSX), Vite, React Router v6, Vitest  
**Origen:** adaptación de SK-011 `angular-routing`

## Objetivo

Diseñar rutas por feature con composición en la raíz, contratos de URL claros y carga diferida apropiada.

## Directrices normativas

### REACT_ROUTING-01

Cada feature migrada es dueña de sus rutas en `<feature>.routes.jsx`, que exporta los `<Route>` (o el arreglo de objetos de ruta) de su dominio. Mientras una feature no se migra, sus rutas siguen donde estén (por ejemplo `main.jsx`).

### REACT_ROUTING-02

El router raíz compone las features sin que una importe páginas sueltas de otra (SK-008R-12).

### REACT_ROUTING-03

Carga diferida por feature. Con `<BrowserRouter>` + `<Routes>`, la carga diferida se hace con `React.lazy(() => import(...))` y un `<Suspense>` con indicador de carga visible; con el data router (`createBrowserRouter`), con la propiedad `lazy` de cada ruta. Seguir el que ya use el proyecto. Las páginas de entrada frecuente (login, dashboard, selección de empresa) pueden quedar en el paquete inicial.

### REACT_ROUTING-04

Un paquete diferido puede fallar al cargar (red, o un despliegue nuevo que borró los archivos viejos). Envolver las rutas diferidas en un error boundary que muestre un mensaje con opción de recargar, en vez de una pantalla en blanco.

### REACT_ROUTING-05

Validar parámetros de ruta y query params antes de usarlos (`useParams`, `useSearchParams`): un `:id` no numérico o inexistente muestra un estado de "no encontrado", no un error sin manejar. Preservar las URL existentes: cambiar una URL publicada rompe favoritos, enlaces de correos y las rutas guardadas en el backend (permisos, menús).

### REACT_ROUTING-06

La protección de rutas usa los envoltorios existentes (`ProtectedRoute`, `AdminRoute`, `PermissionRoute page="..."`); una regla nueva de acceso se agrega ahí, no dentro de una página.

### REACT_ROUTING-07

Ocultar una ruta o un ítem del menú no es autorización: el backend valida cada petición (`AuthRequired`, `PageRequired`, aislamiento por empresa). Nunca confiar en el frontend para impedir el acceso a datos.

### REACT_ROUTING-08

Manejar redirecciones (`<Navigate replace>`), ruta por defecto, `*` sin coincidencia y estados de carga y error de cada ruta.

### REACT_ROUTING-09

Una ruta nueva se registra también donde el proyecto lo pida: títulos, menú, permisos del backend (checklist del `CLAUDE.md` del proyecto). No inventar rutas ni cambiar las existentes sin aprobación.

### REACT_ROUTING-10

El layout compartido es una ruta padre con `<Outlet>`; no carga datos de las features hijas.

## Procedimiento operativo

1. Inspeccionar el router raíz, los guardias de ruta, el layout y el menú.
2. Mapear URL, permisos y páginas afectadas.
3. Aplicar el cambio sin alterar URL publicadas.
4. Verificar con la prueba de humo de rutas, `npx vitest run`, `npx vite build` y navegación manual de las rutas tocadas.

## Criterios de aceptación

- **AC-01:** Rutas coherentes, navegables y con estados de carga y error.
- **AC-02:** URL existentes preservadas y registradas en títulos, menú y permisos.
- **AC-03:** Sin ciclos entre features ni autorización solo en el frontend.
- **AC-04:** Carga diferida con error boundary donde se aplique.

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
- Un `Suspense` sin indicador de carga o sin error boundary.
- Reglas de permisos escritas dentro de las páginas.

## Entregables proporcionales

- Implementación o diagnóstico solicitado y sus contratos afectados.
- Explicación breve de decisiones y alternativas significativas.
- Pruebas o validaciones pertinentes y evidencia real.
- Riesgos, bloqueos y decisiones pendientes si los hubiera.

## Relación con otras skills

- **`react-project-structure`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-best-practices`**: aplicar las reglas pertinentes sin presuponer ejecución automática.
- **`react-testing`**: aplicar las reglas pertinentes sin presuponer ejecución automática.

## Resultado esperado

Una solución coherente con las responsabilidades y límites aprobados, comprensible, verificable y proporcional al problema. El informe final debe distinguir **implementado**, **verificado** y **pendiente**.
