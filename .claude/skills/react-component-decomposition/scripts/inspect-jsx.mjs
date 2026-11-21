#!/usr/bin/env node
// Borrador de diagnóstico de un componente React (JSX/JS) para descomponerlo (SK-026R).
// Lee el archivo con @babel/parser del propio proyecto y mide: tamaño, estado, efectos,
// funciones, complejidad, hubs de estado, grupos cohesivos, regiones del JSX, modos,
// duplicados y señales de las reglas del proyecto. No modifica el proyecto.
//
// Uso (desde la raíz del proyecto React, donde está package.json):
//   node inspect-jsx.mjs <ruta/Pagina.jsx> [--component Nombre] [--min-region 25] [--min-dup 12]
//                        [--json salida.json] [--root <dir>] > borrador.md

import { createRequire } from 'node:module';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

// ---------------------------------------------------------------- argumentos
function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}
const args = parseArgs(process.argv.slice(2));
const fail = (msg) => { process.stderr.write(`inspect-jsx: ${msg}\n`); process.exit(2); };
if (!args._[0]) fail('falta la ruta del componente (.jsx/.js)');
const FILE = resolve(args._[0]);
if (!existsSync(FILE)) fail(`no existe ${FILE}`);
const MIN_REGION = Number(args['min-region'] ?? 25);
const MIN_DUP = Number(args['min-dup'] ?? 12);

function findRoot(start) {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, 'package.json'))) return dir;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}
const ROOT = resolve(args.root ?? findRoot(dirname(FILE)) ?? '.');
let parser;
try {
  parser = createRequire(join(ROOT, 'package.json'))('@babel/parser');
} catch {
  fail(`no se encontró @babel/parser desde ${ROOT}. Instalar dependencias del proyecto (npm install); viene con @vitejs/plugin-react o @babel/core.`);
}
const rel = (p) => relative(ROOT, p).split(sep).join('/');

// ---------------------------------------------------------------- lectura
const SRC = readFileSync(FILE, 'utf-8');
const LINES = SRC.split(/\r?\n/);
let AST;
try {
  AST = parser.parse(SRC, { sourceType: 'module', plugins: ['jsx'], errorRecovery: false });
} catch (e) {
  fail(`no se pudo parsear ${rel(FILE)}: ${e.message}`);
}

const KEYS_SKIP = new Set(['loc', 'start', 'end', 'leadingComments', 'trailingComments', 'innerComments', 'extra', 'range']);
function walk(node, visit, parent = null) {
  if (!node || typeof node.type !== 'string') return;
  if (visit(node, parent) === false) return;
  for (const k of Object.keys(node)) {
    if (KEYS_SKIP.has(k)) continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => c && typeof c.type === 'string' && walk(c, visit, node));
    else if (v && typeof v.type === 'string') walk(v, visit, node);
  }
}
const span = (n) => [n.loc.start.line, n.loc.end.line];
const lenOf = (n) => n.loc.end.line - n.loc.start.line + 1;
const isPascal = (s) => /^[A-Z][A-Za-z0-9]*$/.test(s ?? '');
const isFn = (n) => n && ['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration'].includes(n.type);

function containsJSX(node) {
  let found = false;
  walk(node, (n) => { if (found) return false; if (n.type === 'JSXElement' || n.type === 'JSXFragment') { found = true; return false; } });
  return found;
}

function complexityOf(fn) {
  let c = 1;
  walk(fn.body ?? fn, (n) => {
    if (n !== fn && isFn(n)) return false; // las funciones internas cuentan aparte
    switch (n.type) {
      case 'IfStatement': case 'ConditionalExpression': case 'ForStatement': case 'ForInStatement':
      case 'ForOfStatement': case 'WhileStatement': case 'DoWhileStatement': case 'CatchClause': c++; break;
      case 'SwitchCase': if (n.test) c++; break;
      case 'LogicalExpression': if (['&&', '||', '??'].includes(n.operator)) c++; break;
      default:
    }
  });
  return c;
}

function identifiersIn(node, skipFns = true, root = node) {
  const ids = new Set();
  walk(node, (n) => {
    if (skipFns && n !== root && isFn(n) && n.type === 'FunctionDeclaration') return false;
    if (n.type === 'Identifier' || n.type === 'JSXIdentifier') ids.add(n.name);
  });
  return ids;
}

// ---------------------------------------------------------------- nivel de archivo
const imports = [];
const topDecls = []; // { name, kind, node, lines, isComponent }
for (const st of AST.program.body) {
  if (st.type === 'ImportDeclaration') {
    imports.push({ source: st.source.value, names: st.specifiers.map((s) => s.local.name), line: st.loc.start.line });
    continue;
  }
  const decl = st.type === 'ExportDefaultDeclaration' || st.type === 'ExportNamedDeclaration' ? st.declaration : st;
  if (!decl) continue;
  const exported = st.type === 'ExportDefaultDeclaration' ? 'default' : st.type === 'ExportNamedDeclaration' ? 'named' : null;
  if (decl.type === 'FunctionDeclaration' && decl.id) {
    topDecls.push({ name: decl.id.name, node: decl, fn: decl, exported, stmt: st });
  } else if (decl.type === 'VariableDeclaration') {
    for (const d of decl.declarations) {
      if (d.id.type !== 'Identifier') continue;
      topDecls.push({ name: d.id.name, node: d, fn: isFn(d.init) ? d.init : null, init: d.init, exported, stmt: st });
    }
  }
}
for (const d of topDecls) {
  d.lines = lenOf(d.stmt);
  d.span = span(d.stmt);
  d.isComponent = isPascal(d.name) && !!d.fn && containsJSX(d.fn);
  d.isIcon = /^Icon[A-Z]/.test(d.name) && d.isComponent;
  d.kind = d.isIcon ? 'icono' : d.isComponent ? 'componente' : d.fn ? 'función' : 'constante';
}
const serviceImports = imports.filter((i) => /services\//.test(i.source));
const serviceNames = new Set(serviceImports.flatMap((i) => i.names));

const components = topDecls.filter((d) => d.isComponent && !d.isIcon);
if (!components.length) fail('no se encontró ningún componente (función en PascalCase que devuelve JSX)');
const defaultName = (() => {
  const exp = AST.program.body.find((s) => s.type === 'ExportDefaultDeclaration');
  if (exp?.declaration?.id?.name) return exp.declaration.id.name;
  if (exp?.declaration?.type === 'Identifier') return exp.declaration.name;
  return null;
})();
const TARGET = components.find((c) => c.name === (args.component ?? defaultName)) ?? [...components].sort((a, b) => b.lines - a.lines)[0];
const FN = TARGET.fn;

// ---------------------------------------------------------------- dentro del componente
const state = []; // { name, setter, line, init }
const refs = [];
const memos = [];
const effects = []; // { line, lines, deps, node }
const customHooks = [];
const fns = []; // { name, node, lines, span, complexity }
const nested = []; // componentes definidos dentro
const body = FN.body.type === 'BlockStatement' ? FN.body.body : [];

function hookName(call) {
  if (call?.type !== 'CallExpression') return null;
  const c = call.callee;
  if (c.type === 'Identifier' && /^use[A-Z]/.test(c.name)) return c.name;
  if (c.type === 'MemberExpression' && c.property.type === 'Identifier' && /^use[A-Z]/.test(c.property.name)) return c.property.name;
  return null;
}

for (const st of body) {
  if (st.type === 'VariableDeclaration') {
    for (const d of st.declarations) {
      const h = hookName(d.init);
      if (h === 'useState' || h === 'useReducer') {
        if (d.id.type === 'ArrayPattern') {
          const [v, s] = d.id.elements;
          state.push({ name: v?.name ?? '(sin nombre)', setter: s?.name ?? null, line: d.loc.start.line, hook: h });
        }
      } else if (h === 'useRef') refs.push({ name: d.id.name, line: d.loc.start.line });
      else if (h === 'useMemo' || h === 'useCallback') {
        memos.push({ name: d.id.name, line: d.loc.start.line, hook: h });
        if (h === 'useCallback' && isFn(d.init.arguments[0])) fns.push({ name: d.id.name, node: d.init.arguments[0], stmt: st });
      } else if (h) customHooks.push({ name: h, line: d.loc.start.line, binds: d.id.type === 'Identifier' ? [d.id.name] : [...identifiersIn(d.id)] });
      else if (d.id.type === 'Identifier' && isFn(d.init)) {
        if (isPascal(d.id.name) && containsJSX(d.init)) nested.push({ name: d.id.name, line: d.loc.start.line, lines: lenOf(st) });
        else fns.push({ name: d.id.name, node: d.init, stmt: st });
      }
    }
  } else if (st.type === 'FunctionDeclaration' && st.id) {
    if (isPascal(st.id.name) && containsJSX(st)) nested.push({ name: st.id.name, line: st.loc.start.line, lines: lenOf(st) });
    else fns.push({ name: st.id.name, node: st, stmt: st });
  } else if (st.type === 'ExpressionStatement' && ['useEffect', 'useLayoutEffect'].includes(hookName(st.expression))) {
    const [cb, deps] = st.expression.arguments;
    effects.push({ name: `efecto@${st.loc.start.line}`, line: st.loc.start.line, lines: lenOf(st), node: cb, deps: deps ? SRC.slice(deps.start, deps.end).replace(/\s+/g, ' ') : '(sin arreglo: corre en cada render)' });
  }
}
for (const f of fns) { f.lines = lenOf(f.stmt); f.span = span(f.stmt); f.complexity = complexityOf(f.node); }

// Miembros y referencias
const stateKey = new Map(); // identificador -> estado
for (const s of state) { stateKey.set(s.name, s.name); if (s.setter) stateKey.set(s.setter, s.name); }
const fnNames = new Set(fns.map((f) => f.name));
function usage(node) {
  const ids = identifiersIn(node, false);
  const st = new Set(); const calls = new Set(); const services = new Set();
  for (const id of ids) {
    if (stateKey.has(id)) st.add(stateKey.get(id));
    if (fnNames.has(id)) calls.add(id);
    if (serviceNames.has(id)) services.add(id);
  }
  return { state: st, calls, services };
}
const members = [
  ...fns.map((f) => ({ id: f.name, kind: 'función', lines: f.lines, span: f.span, complexity: f.complexity, ...usage(f.node) })),
  ...effects.map((e) => ({ id: e.name, kind: 'efecto', lines: e.lines, span: [e.line, e.line + e.lines - 1], complexity: complexityOf(e.node), deps: e.deps, ...usage(e.node) })),
];
for (const m of members) m.calls.delete(m.id);

// Hubs: estado usado por muchas funciones/efectos
const stateUse = new Map(state.map((s) => [s.name, new Set()]));
for (const m of members) for (const s of m.state) stateUse.get(s)?.add(m.id);
const HUB_MIN = Math.max(6, Math.ceil(members.length * 0.35));
const hubs = [...stateUse.entries()].filter(([, set]) => set.size >= HUB_MIN).map(([name, set]) => ({ name, users: set.size }));
const hubSet = new Set(hubs.map((h) => h.name));

// Grupos cohesivos: componentes conexos del grafo función/efecto <-> estado, sin pasar por hubs.
function groups(excludeHubs) {
  const nodes = [...members.map((m) => `m:${m.id}`), ...state.filter((s) => !(excludeHubs && hubSet.has(s.name))).map((s) => `s:${s.name}`)];
  const adj = new Map(nodes.map((n) => [n, new Set()]));
  const link = (a, b) => { if (adj.has(a) && adj.has(b)) { adj.get(a).add(b); adj.get(b).add(a); } };
  for (const m of members) {
    for (const s of m.state) link(`m:${m.id}`, `s:${s}`);
    for (const c of m.calls) link(`m:${m.id}`, `m:${c}`);
  }
  const seen = new Set(); const out = [];
  for (const n of nodes) {
    if (seen.has(n)) continue;
    const comp = []; const stack = [n]; seen.add(n);
    while (stack.length) { const x = stack.pop(); comp.push(x); for (const y of adj.get(x)) if (!seen.has(y)) { seen.add(y); stack.push(y); } }
    out.push(comp);
  }
  return out;
}
const groupsAll = groups(false).filter((g) => g.some((x) => x.startsWith('m:')));
const groupsNoHub = groups(true).filter((g) => g.some((x) => x.startsWith('m:')) && g.length > 1);

// ---------------------------------------------------------------- JSX
const returns = []; // JSX devueltos por el componente (modos)
walk(FN.body, (n) => {
  if (n !== FN && isFn(n)) return false;
  if (n.type === 'ReturnStatement' && n.argument && containsJSX(n.argument)) returns.push(n);
});
let jsxDepth = 0;
const modals = []; const overlays = []; const regions = [];
const signals = { newButton: [], indexKeys: [], windowConfirm: [], alerts: [], nativeSelect: [], nativeTable: [], inlineStyles: 0, emptyCatch: [], localStorage: [], dangerous: [] };
const MODAL_TAGS = new Set(['Modal', 'ConfirmModal', 'ConfirmDeleteModal']);
const tagName = (el) => {
  const n = el.openingElement?.name;
  if (!n) return '<>';
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXMemberExpression') return `${n.object.name}.${n.property.name}`;
  return '?';
};
function depthWalk(node, d) {
  if (!node || typeof node.type !== 'string') return;
  const isEl = node.type === 'JSXElement' || node.type === 'JSXFragment';
  const nd = isEl ? d + 1 : d;
  if (isEl) jsxDepth = Math.max(jsxDepth, nd);
  for (const k of Object.keys(node)) {
    if (KEYS_SKIP.has(k)) continue;
    const v = node[k];
    if (Array.isArray(v)) v.forEach((c) => depthWalk(c, nd));
    else if (v && typeof v.type === 'string') depthWalk(v, nd);
  }
}
depthWalk(FN.body, 0);

walk(AST.program, (n, parent) => {
  if (n.type === 'JSXElement') {
    const t = tagName(n);
    if (MODAL_TAGS.has(t)) modals.push({ tag: t, span: span(n), lines: lenOf(n) });
    if (t === 'select') signals.nativeSelect.push(n.loc.start.line);
    if (t === 'table') signals.nativeTable.push(n.loc.start.line);
  }
  if (n.type === 'JSXAttribute' && n.name?.name === 'key' && n.value?.type === 'JSXExpressionContainer') {
    const e = n.value.expression;
    if (e.type === 'Identifier' && /^(i|idx|index|j|k)$/.test(e.name)) signals.indexKeys.push(n.loc.start.line);
  }
  if (n.type === 'JSXAttribute' && n.name?.name === 'style') signals.inlineStyles++;
  if (n.type === 'JSXAttribute' && n.name?.name === 'dangerouslySetInnerHTML') signals.dangerous.push(n.loc.start.line);
  if (n.type === 'CallExpression') {
    const c = n.callee;
    const name = c.type === 'Identifier' ? c.name : c.type === 'MemberExpression' && c.property.type === 'Identifier' ? `${c.object.name ?? ''}.${c.property.name}` : '';
    if (name === 'confirm' || name === 'window.confirm') signals.windowConfirm.push(n.loc.start.line);
    if (name === 'alert' || name === 'window.alert') signals.alerts.push(n.loc.start.line);
    if (/^localStorage\./.test(name)) signals.localStorage.push(n.loc.start.line);
  }
  if (n.type === 'CatchClause' && n.body.body.length === 0) signals.emptyCatch.push(n.loc.start.line);
  // Botón de alta con texto distinto de "+ Nuevo" (CLAUDE.md)
  if (n.type === 'JSXText' && /^\s*\+\s*\S/.test(n.value) && n.value.trim() !== '+ Nuevo' && parent?.type === 'JSXElement' && tagName(parent) === 'button') signals.newButton.push(`${n.loc.start.line} "${n.value.trim()}"`);
  // Overlay propio: objeto de estilo con position fixed e inset 0
  if (n.type === 'ObjectExpression') {
    const props = Object.fromEntries(n.properties.filter((p) => p.type === 'ObjectProperty' && (p.key.name || p.key.value)).map((p) => [p.key.name ?? p.key.value, p.value.value ?? p.value.name]));
    if (props.position === 'fixed' && (props.inset === 0 || props.inset === '0')) overlays.push(n.loc.start.line);
  }
});

// Regiones: ramas condicionales y elementos grandes del JSX devuelto.
function regionUsage(node) {
  const u = usage(node);
  return { state: [...u.state], handlers: [...u.calls] };
}
const MIN_MODE = 10; // una vista alternativa cuenta como modo aunque sea más chica que MIN_REGION
function addRegion(kind, node, label) {
  if (lenOf(node) < (kind.startsWith('modo') ? MIN_MODE : MIN_REGION)) return;
  if (regions.some((r) => r.span[0] === node.loc.start.line && r.span[1] === node.loc.end.line)) return;
  regions.push({ kind, label, span: span(node), lines: lenOf(node), node, ...regionUsage(node) });
}
for (const r of returns) {
  // modo: un return dentro de un if (vista alternativa completa)
  let cond = null;
  walk(FN.body, (n) => {
    if (n !== FN && isFn(n)) return false;
    if (n.type === 'IfStatement' && n.loc.start.line <= r.loc.start.line && n.loc.end.line >= r.loc.end.line) cond = SRC.slice(n.test.start, n.test.end).replace(/\s+/g, ' ').slice(0, 60);
  });
  addRegion(cond ? 'modo (return en if)' : 'return principal', r.argument, cond ? `si ${cond}` : 'vista principal');
}
for (const r of returns) {
  walk(r.argument, (n) => {
    if (n.type === 'LogicalExpression' && n.operator === '&&' && containsJSX(n.right)) addRegion('condicional &&', n.right, SRC.slice(n.left.start, n.left.end).replace(/\s+/g, ' ').slice(0, 60));
    if (n.type === 'ConditionalExpression' && containsJSX(n.consequent)) {
      addRegion('ternario (sí)', n.consequent, SRC.slice(n.test.start, n.test.end).replace(/\s+/g, ' ').slice(0, 60));
      addRegion('ternario (no)', n.alternate, `!(${SRC.slice(n.test.start, n.test.end).replace(/\s+/g, ' ').slice(0, 55)})`);
    }
    if (n.type === 'JSXElement' && MODAL_TAGS.has(tagName(n))) addRegion('modal', n, `<${tagName(n)}>`);
    if (n.type === 'JSXElement' && ['form', 'section', 'table', 'DataTable'].includes(tagName(n))) addRegion('bloque', n, `<${tagName(n)}>`);
  });
}
regions.sort((a, b) => a.span[0] - b.span[0]);
// Estado exclusivo de cada región
const regionOwners = new Map();
for (const r of regions) for (const s of r.state) regionOwners.set(s, (regionOwners.get(s) ?? 0) + 1);
for (const r of regions) r.exclusive = r.state.filter((s) => regionOwners.get(s) === 1);

const bigBranches = regions.filter((r) => r.kind.startsWith('modo') || (r.kind.startsWith('ternario') && r.lines >= 2 * MIN_REGION));
const modeSwitches = regions.filter((r) => r.kind.startsWith('modo')).length + (regions.filter((r) => r.kind === 'ternario (sí)' && r.lines >= 2 * MIN_REGION).length);

// ---------------------------------------------------------------- duplicados
const norm = (l) => l.trim().replace(/\s+/g, ' ');
function linesOf([a, b]) { return LINES.slice(a - 1, b).map(norm).filter((l) => l && !/^[{}()[\];,]*$/.test(l)); }
function dice(la, lb) {
  const count = (arr) => arr.reduce((m, l) => m.set(l, (m.get(l) ?? 0) + 1), new Map());
  const ca = count(la); const cb = count(lb); let inter = 0;
  for (const [l, n] of ca) inter += Math.min(n, cb.get(l) ?? 0);
  return la.length + lb.length ? (2 * inter) / (la.length + lb.length) : 0;
}
const dupCandidates = [
  ...regions.filter((r) => r.lines >= MIN_DUP).map((r) => ({ what: `región ${r.label}`, span: r.span })),
  ...fns.filter((f) => f.lines >= MIN_DUP).map((f) => ({ what: `función ${f.name}`, span: f.span })),
];
const dups = [];
for (let i = 0; i < dupCandidates.length; i++) for (let j = i + 1; j < dupCandidates.length; j++) {
  const a = dupCandidates[i]; const b = dupCandidates[j];
  if (a.span[0] <= b.span[0] && a.span[1] >= b.span[1]) continue; // contenida
  if (b.span[0] <= a.span[0] && b.span[1] >= a.span[1]) continue;
  const s = dice(linesOf(a.span), linesOf(b.span));
  if (s >= 0.6) dups.push({ a, b, similarity: Math.round(s * 100) / 100 });
}
dups.sort((x, y) => y.similarity - x.similarity);

// ---------------------------------------------------------------- métricas y nivel
const maxFn = [...members].sort((a, b) => b.lines - a.lines)[0];
const maxCx = [...members].sort((a, b) => b.complexity - a.complexity)[0];
const lcom4 = members.length + state.length >= 15 ? groupsAll.length : null;
const icons = topDecls.filter((d) => d.isIcon);
const metrics = {
  fileLines: LINES.length,
  componentLines: TARGET.lines,
  useState: state.length,
  effects: effects.length,
  functions: fns.length,
  modals: modals.length,
  customOverlays: overlays.length,
  modeSwitches,
  maxFunctionLines: maxFn?.lines ?? 0,
  maxComplexity: maxCx?.complexity ?? 0,
  jsxDepth,
  nestedComponents: nested.length,
  lcom4,
};
const T = {
  fileLines: [300, 500, 1000],
  componentLines: [250, 400, 800],
  useState: [8, 15, 25],
  effects: [3, 5, 8],
  functions: [12, 20, 35],
  modals: [2, 3, 5],
  customOverlays: [1, 1, 2],
  modeSwitches: [1, 1, 2],
  maxFunctionLines: [40, 60, 120],
  maxComplexity: [10, 15, 25],
  jsxDepth: [10, 14, 20],
  nestedComponents: [1, 2, 4],
  lcom4: [2, 4, 8],
};
const LEVELS = ['Saludable', 'Observación', 'Smell', 'Crítico'];
const levelOf = (v, [o, s, c]) => (v == null ? 0 : v >= c ? 3 : v >= s ? 2 : v >= o ? 1 : 0);
const levels = Object.fromEntries(Object.keys(T).map((k) => [k, levelOf(metrics[k], T[k])]));
const nCrit = Object.values(levels).filter((l) => l === 3).length;
const nSmell = Object.values(levels).filter((l) => l === 2).length;
const nObs = Object.values(levels).filter((l) => l === 1).length;
const globalLevel = nCrit >= 2 ? 3 : nCrit === 1 || nSmell >= 3 ? 2 : nSmell >= 1 || nObs >= 3 ? 1 : 0;

// ---------------------------------------------------------------- informe
const out = [];
const P = (s = '') => out.push(s);
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const rng = ([a, b]) => (a === b ? `${a}` : `${a}-${b}`);
const today = new Date().toISOString().slice(0, 10);

P(`# Borrador de descomposición — ${TARGET.name}`);
P('');
P(`Archivo: \`${rel(FILE)}\` · componente analizado: \`${TARGET.name}\` (líneas ${rng(TARGET.span)}) · fecha: ${today}`);
P(`Generado por \`inspect-jsx.mjs\` (SK-026R). Es un borrador con datos: cada señal se confirma o descarta leyendo el código.`);
P('');
P(`## Condición: **${LEVELS[globalLevel]}**`);
P('');
P('| Métrica | Valor | Observación / Smell / Crítico | Nivel |');
P('|---|---:|---|---|');
for (const k of Object.keys(T)) P(`| \`${k}\` | ${metrics[k] ?? 'n/a'} | ${T[k].join(' / ')} | ${LEVELS[levels[k]]} |`);
P('');
P('## Inventario del archivo');
P('');
P('| Declaración | Tipo | Líneas | Rango |');
P('|---|---|---:|---|');
for (const d of topDecls) P(`| \`${d.name}\` | ${d.kind}${d.exported ? ` (export ${d.exported})` : ''} | ${d.lines} | ${rng(d.span)} |`);
P('');
P(`Servicios importados: ${serviceImports.length ? serviceImports.map((i) => `\`${i.names.join(', ')}\` de \`${i.source}\``).join('; ') : 'ninguno'}.`);
P(`Hooks: ${state.length} useState/useReducer, ${effects.length} efectos, ${refs.length} useRef, ${memos.length} useMemo/useCallback, personalizados: ${customHooks.map((h) => `\`${h.name}\``).join(', ') || 'ninguno'}.`);
P('');
P('## Estado');
P('');
P('| Estado | Setter | Línea | Lo usan |');
P('|---|---|---:|---:|');
for (const s of state) P(`| \`${s.name}\` | \`${s.setter ?? '-'}\` | ${s.line} | ${stateUse.get(s.name)?.size ?? 0}${hubSet.has(s.name) ? ' (hub)' : ''} |`);
P('');
P(`Hubs (usados por ${HUB_MIN} o más funciones/efectos): ${hubs.length ? hubs.map((h) => `\`${h.name}\` (${h.users})`).join(', ') : 'ninguno'}.`);
P('');
P('## Funciones y efectos');
P('');
P('| Miembro | Tipo | Líneas | Rango | Complejidad | Estado que toca | Llama a | Servicios |');
P('|---|---|---:|---|---:|---|---|---|');
for (const m of [...members].sort((a, b) => b.lines - a.lines)) {
  P(`| \`${m.id}\` | ${m.kind} | ${m.lines} | ${rng(m.span)} | ${m.complexity} | ${cell([...m.state].join(', '))} | ${cell([...m.calls].join(', '))} | ${cell([...m.services].join(', '))} |`);
}
if (effects.length) {
  P('');
  P('Dependencias de los efectos: ' + effects.map((e) => `línea ${e.line} \`${e.deps}\``).join('; ') + '.');
}
P('');
P('## Grupos cohesivos (sin pasar por los hubs)');
P('');
if (!groupsNoHub.length) P('Ninguno: sin hubs, todo queda conectado o aislado.');
groupsNoHub.forEach((g, i) => {
  const ms = g.filter((x) => x.startsWith('m:')).map((x) => x.slice(2));
  const ss = g.filter((x) => x.startsWith('s:')).map((x) => x.slice(2));
  P(`${i + 1}. Estado: ${ss.map((s) => `\`${s}\``).join(', ') || '—'} · funciones/efectos: ${ms.map((s) => `\`${s}\``).join(', ')}`);
});
P('');
P(`Componentes conexos con hubs incluidos (lcom4): ${groupsAll.length}${lcom4 == null ? ' (no se evalúa con menos de 15 miembros)' : ''}.`);
P('');
P(`## Regiones del JSX (≥ ${MIN_REGION} líneas)`);
P('');
if (!regions.length) P('Ninguna región alcanza el tamaño mínimo.');
else {
  P('| Región | Tipo | Líneas | Rango | Estado que usa | Exclusivo | Funciones que usa |');
  P('|---|---|---:|---|---|---|---|');
  for (const r of regions) P(`| ${cell(r.label)} | ${r.kind} | ${r.lines} | ${rng(r.span)} | ${cell(r.state.join(', '))} | ${cell(r.exclusive.join(', '))} | ${cell(r.handlers.join(', '))} |`);
}
P('');
P(`Modos (vistas alternativas completas): ${modeSwitches}. Ramas grandes: ${bigBranches.map((r) => `${r.label} (${rng(r.span)})`).join('; ') || 'ninguna'}.`);
P(`Modales: ${modals.map((m) => `\`<${m.tag}>\` ${rng(m.span)}`).join(', ') || 'ninguno'}. Overlays propios (position fixed + inset 0): ${overlays.length ? overlays.map((l) => `línea ${l}`).join(', ') : 'ninguno'}.`);
P(`Profundidad máxima del JSX: ${jsxDepth}. Componentes definidos dentro de \`${TARGET.name}\`: ${nested.map((n) => `\`${n.name}\` (${n.line})`).join(', ') || 'ninguno'}.`);
P('');
P(`## Duplicados (similitud ≥ 0,6; bloques ≥ ${MIN_DUP} líneas)`);
P('');
if (!dups.length) P('Ninguno.');
for (const d of dups.slice(0, 15)) P(`- ${d.similarity}: ${d.a.what} (${rng(d.a.span)}) ↔ ${d.b.what} (${rng(d.b.span)})`);
P('');
P('## Señales de las reglas del proyecto');
P('');
const sig = (label, arr, rule) => P(`| ${label} | ${Array.isArray(arr) ? arr.length : arr} | ${Array.isArray(arr) && arr.length ? arr.slice(0, 12).join(', ') : '—'} | ${rule} |`);
P('| Señal | Cantidad | Líneas | Regla |');
P('|---|---:|---|---|');
sig('`window.confirm` / `confirm()`', signals.windowConfirm, 'CLAUDE.md (ConfirmDeleteModal), SK-014R-09');
sig('`alert()`', signals.alerts, 'SK-014R-07 (mensajes visibles en la página)');
sig('Overlays propios', overlays, 'SK-014R-09 (usar Modal)');
sig('`key` con índice', signals.indexKeys, 'SK-014R-04');
sig('`catch` vacío', signals.emptyCatch, 'SK-015R-05, SK-012R-07');
sig('`localStorage` en la página', signals.localStorage, 'SK-012R-02/10');
sig('`<select>` nativo', signals.nativeSelect, 'CLAUDE.md (SearchableSelect)');
sig('Botón de alta distinto de `+ Nuevo`', signals.newButton, 'CLAUDE.md');
sig('`<table>` propia', signals.nativeTable, 'SK-014R-11 (DataTable)');
sig('Iconos definidos en el archivo', icons.map((i) => i.span[0]), 'SK-014R-11 (shared/icons)');
sig('Componentes anidados', nested.map((n) => n.line), 'SK-009R-05');
sig('`dangerouslySetInnerHTML`', signals.dangerous, 'SK-009R-08');
sig('Atributos `style` en línea', signals.inlineStyles, 'SK-014R-05 (solo valores dinámicos)');
P('');
P('## Próximo paso');
P('');
P('Leer el código en los rangos señalados, confirmar o descartar cada señal con evidencia y reescribir este borrador con `references/report.md` de la skill.');

process.stdout.write(out.join('\n') + '\n');

if (args.json) {
  const strip = (r) => { const { node, ...rest } = r; return rest; };
  writeFileSync(resolve(args.json), JSON.stringify({
    file: rel(FILE), component: TARGET.name, date: today, level: LEVELS[globalLevel], metrics, levels,
    state, effects: effects.map(({ node, ...e }) => e), members: members.map((m) => ({ ...m, state: [...m.state], calls: [...m.calls], services: [...m.services] })),
    hubs, groups: groupsNoHub, regions: regions.map(strip), dups, signals: { ...signals, overlays, icons: icons.map((i) => i.name), nested },
  }, null, 1));
}
