#!/usr/bin/env node
// Inventario de marcado reutilizable en un frontend React (JSX), SK-027R.
// Lee los .jsx con @babel/parser del propio proyecto, toma la huella de cada elemento
// y agrupa los bloques repetidos entre archivos. No modifica el proyecto.
//
// Uso (desde la raíz del proyecto, donde está package.json):
//   node ui-reuse-jsx.mjs [--scope src/pages] (--discover | --adoption | --family nombre[,nombre]
//                          | --example archivo:inicio-fin) [--threshold 0.75] [--min-nodes 8]
//                          [--min-files 3] [--json salida.json] > borrador.md

import { createRequire } from 'node:module';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2); const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true; else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}
const args = parseArgs(process.argv.slice(2));
const fail = (m) => { process.stderr.write(`ui-reuse-jsx: ${m}\n`); process.exit(2); };
const ROOT = resolve(args.root ?? '.');
if (!existsSync(join(ROOT, 'package.json'))) fail(`no hay package.json en ${ROOT}; ejecutar desde la raíz del proyecto React o pasar --root`);
let parser;
try { parser = createRequire(join(ROOT, 'package.json'))('@babel/parser'); } catch { fail('no se encontró @babel/parser en el proyecto (npm install)'); }
const SCOPE = resolve(ROOT, args.scope ?? 'src');
const THRESHOLD = Number(args.threshold ?? 0.75);
const MIN_NODES = Number(args['min-nodes'] ?? 8);
const MIN_FILES = Number(args['min-files'] ?? 3);
const rel = (p) => relative(ROOT, p).split(sep).join('/');
const MODE = args.example ? 'example' : args.family ? 'family' : args.adoption ? 'adoption' : 'discover';

// ---------------------------------------------------------------- archivos
function walkDir(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walkDir(p));
    else if (/\.jsx$/.test(name) && !/\.test\.jsx$/.test(name) && !/[\\/](__tests__|tests)[\\/]/.test(p)) out.push(p);
  }
  return out;
}
const files = walkDir(SCOPE);
const isShared = (f) => /[\\/](components[\\/]ui|shared)[\\/]/.test(f);

const KEYS_SKIP = new Set(['loc', 'start', 'end', 'leadingComments', 'trailingComments', 'innerComments', 'extra']);
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
const tagOf = (el) => {
  const n = el.openingElement?.name;
  if (!n) return '<>';
  if (n.type === 'JSXIdentifier') return n.name;
  if (n.type === 'JSXMemberExpression') return `${n.object.name}.${n.property.name}`;
  return '?';
};
// Clases: className="a b", className={styles.x}, className={`${styles.a} ${styles.b}`}
function classesOf(el) {
  const out = [];
  for (const a of el.openingElement?.attributes ?? []) {
    if (a.type !== 'JSXAttribute' || a.name?.name !== 'className' || !a.value) continue;
    if (a.value.type === 'StringLiteral') out.push(...a.value.value.split(/\s+/).filter(Boolean));
    else walk(a.value, (n) => { if (n.type === 'MemberExpression' && n.property.type === 'Identifier') out.push(n.property.name); if (n.type === 'StringLiteral') out.push(...n.value.split(/\s+/).filter(Boolean)); });
  }
  return out;
}
const attrNames = (el) => (el.openingElement?.attributes ?? []).filter((a) => a.type === 'JSXAttribute').map((a) => a.name?.name).filter((n) => n && n !== 'key' && n !== 'className');

// ---------------------------------------------------------------- familias
const FAMILIES = {
  'boton-primario': { label: 'Botón primario', test: (el) => tagOf(el) === 'button' && classesOf(el).some((c) => /btnPrimary/.test(c)), use: 'clase `btnPrimary` de admin.module.css' },
  'boton-icono': { label: 'Botón de ícono (acción de tabla)', test: (el) => tagOf(el) === 'button' && classesOf(el).some((c) => /iconBtn/.test(c)), use: '`iconBtn` + icono de `shared/icons` con `aria-label` y `title`' },
  'select-nativo': { label: '`<select>` nativo', test: (el) => tagOf(el) === 'select', use: '`SearchableSelect` (CLAUDE.md)' },
  'tabla-propia': { label: '`<table>` propia', test: (el) => tagOf(el) === 'table', use: '`DataTable`' },
  'campo-con-label': { label: 'Campo con etiqueta (`formGroup`)', test: (el) => tagOf(el) === 'div' && classesOf(el).some((c) => /formGroup|field/i.test(c)), use: 'patrón de campo del formulario (SK-017R-05)' },
  'modal': { label: '`Modal` / confirmaciones', test: (el) => ['Modal', 'ConfirmModal', 'ConfirmDeleteModal'].includes(tagOf(el)), use: 'componentes de `components/ui`' },
  'tabla-datos': { label: '`DataTable`', test: (el) => tagOf(el) === 'DataTable', use: '—' },
  'searchable-select': { label: '`SearchableSelect`', test: (el) => tagOf(el) === 'SearchableSelect', use: '—' },
  'alerta': { label: 'Mensaje de error/éxito', test: (el) => tagOf(el) === 'div' && classesOf(el).some((c) => /alert(Error|Success)|errorMsg|error$/i.test(c)), use: 'mensaje accesible (`role="alert"`)' },
};

// ---------------------------------------------------------------- lectura
const elements = []; // { file, line, end, tag, tokens, nodes, el }
const parseErrors = [];
const localIcons = [];
const imports = new Map(); // nombre importado desde components/ui o shared/ -> archivos
for (const f of files) {
  const src = readFileSync(f, 'utf-8');
  let ast;
  try { ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx'] }); } catch (e) { parseErrors.push(`${rel(f)}: ${e.message}`); continue; }
  for (const st of ast.program.body) {
    if (st.type === 'ImportDeclaration' && /components\/ui\/|\/shared\//.test(st.source.value)) {
      for (const s of st.specifiers) { const name = s.type === 'ImportSpecifier' ? s.imported.name : s.local.name; if (!imports.has(name)) imports.set(name, new Set()); imports.get(name).add(rel(f)); }
    }
    const d = st.type === 'VariableDeclaration' ? st.declarations[0] : st.type === 'FunctionDeclaration' ? st : null;
    const name = d?.id?.name;
    if (name && /^Icon[A-Z]/.test(name)) localIcons.push({ file: rel(f), name, line: st.loc.start.line });
  }
  walk(ast.program, (n) => {
    if (n.type !== 'JSXElement') return;
    const tokens = [];
    let nodes = 0;
    const visit = (el, depth) => {
      nodes++;
      const t = tagOf(el);
      tokens.push(`tag:${depth}:${t}`, `tag:${t}`);
      for (const c of classesOf(el)) tokens.push(`cls:${c}`);
      for (const a of attrNames(el)) tokens.push(`attr:${t}.${a}`);
      for (const ch of el.children ?? []) {
        if (ch.type === 'JSXElement') visit(ch, depth + 1);
        else if (ch.type === 'JSXText' && ch.value.trim()) tokens.push('text');
        else if (ch.type === 'JSXExpressionContainer') {
          tokens.push('expr');
          walk(ch, (x) => { if (x.type === 'JSXElement' && x !== ch) { visit(x, depth + 1); return false; } });
        }
      }
    };
    visit(n, 0);
    elements.push({ file: rel(f), line: n.loc.start.line, end: n.loc.end.line, tag: tagOf(n), tokens, nodes, el: n, shared: isShared(f) });
  });
}

// ---------------------------------------------------------------- similitud
function bag(tokens) { const m = new Map(); for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1); return m; }
const W = (t) => (t.startsWith('tag:') ? (t.split(':').length === 3 ? 2 : 1) : t.startsWith('cls:') ? 1.5 : 1);
function similarity(a, b) {
  const A = a.bag ?? (a.bag = bag(a.tokens)); const B = b.bag ?? (b.bag = bag(b.tokens));
  let inter = 0; let uni = 0;
  for (const k of new Set([...A.keys(), ...B.keys()])) { const x = A.get(k) ?? 0; const y = B.get(k) ?? 0; inter += Math.min(x, y) * W(k); uni += Math.max(x, y) * W(k); }
  return uni ? inter / uni : 0;
}
const fingerprint = (e) => e.tokens.filter((t) => t.split(':').length === 3 || t.startsWith('cls:')).join('|');

// ---------------------------------------------------------------- salida
const out = []; const P = (s = '') => out.push(s);
const today = new Date().toISOString().slice(0, 10);
const json = { mode: MODE, date: today, scope: rel(SCOPE) || '.', files: files.length, parseErrors };
P(`# Borrador de reutilización de UI — ${MODE}`);
P('');
P(`Alcance: \`${rel(SCOPE) || '.'}\` · ${files.length} archivos .jsx · fecha: ${today}. Generado por \`ui-reuse-jsx.mjs\` (SK-027R). Cada grupo se confirma leyendo el código.`);
if (parseErrors.length) P(`\nNo se pudieron leer ${parseErrors.length} archivos: ${parseErrors.slice(0, 5).join('; ')}`);
P('');

const consumers = elements.filter((e) => !e.shared);
if (MODE === 'family') {
  const names = String(args.family).split(',');
  json.families = {};
  for (const name of names) {
    const fam = FAMILIES[name];
    if (!fam) fail(`familia desconocida: ${name}. Disponibles: ${Object.keys(FAMILIES).join(', ')}`);
    const occ = consumers.filter((e) => fam.test(e.el));
    const byFile = occ.reduce((m, e) => m.set(e.file, [...(m.get(e.file) ?? []), e.line]), new Map());
    json.families[name] = [...byFile].map(([file, lines]) => ({ file, lines }));
    P(`## ${fam.label}: ${occ.length} usos en ${byFile.size} archivos`);
    P('');
    P(`Componente o patrón del proyecto: ${fam.use}.`);
    P('');
    P('| Archivo | Usos | Líneas |');
    P('|---|---:|---|');
    for (const [file, lines] of [...byFile].sort((a, b) => b[1].length - a[1].length)) P(`| \`${file}\` | ${lines.length} | ${lines.slice(0, 10).join(', ')}${lines.length > 10 ? '…' : ''} |`);
    P('');
  }
} else if (MODE === 'adoption') {
  // UI compartida: components/ui (proyectos existentes) o shared/ui (estructura SK-008R).
  const uiDirs = [join(ROOT, 'src', 'components', 'ui'), join(ROOT, 'src', 'shared', 'ui')];
  const sharedIcons = join(ROOT, 'src', 'shared', 'icons', 'index.jsx');
  const names = [];
  for (const uiDir of uiDirs) if (existsSync(uiDir)) for (const n of readdirSync(uiDir)) if (/\.jsx$/.test(n)) names.push(n.replace(/\.jsx$/, ''));
  if (existsSync(sharedIcons)) for (const m of readFileSync(sharedIcons, 'utf-8').matchAll(/export function (Icon\w+)/g)) names.push(m[1]);
  json.adoption = names.map((n) => ({ name: n, files: [...(imports.get(n) ?? [])].filter((f) => !/components\/ui\/|shared\//.test(f)).length }));
  P('## Adopción de los componentes compartidos');
  P('');
  P('| Componente | Archivos que lo importan |');
  P('|---|---:|');
  for (const a of json.adoption.sort((x, y) => y.files - x.files)) P(`| \`${a.name}\` | ${a.files} |`);
  P('');
  const iconFiles = new Set(localIcons.map((i) => i.file));
  P(`Iconos definidos localmente: ${localIcons.length} en ${iconFiles.size} archivos (deberían venir de \`shared/icons\`, SK-014R-11).`);
  json.localIcons = localIcons.length;
} else if (MODE === 'example') {
  const m = /^(.+):(\d+)-(\d+)$/.exec(String(args.example));
  if (!m) fail('--example espera archivo:inicio-fin');
  const exFile = rel(resolve(ROOT, m[1]));
  const [a, b] = [Number(m[2]), Number(m[3])];
  const inRange = elements.filter((e) => e.file === exFile && e.line >= a && e.end <= b).sort((x, y) => y.nodes - x.nodes);
  if (!inRange.length) fail(`no hay elementos JSX completos en ${exFile}:${a}-${b}`);
  const ex = inRange[0];
  const similar = consumers.filter((e) => e !== ex && !(e.file === ex.file && e.line >= ex.line && e.end <= ex.end) && Math.abs(e.nodes - ex.nodes) <= ex.nodes)
    .map((e) => ({ e, s: similarity(ex, e) })).filter((x) => x.s >= THRESHOLD)
    .sort((x, y) => y.s - x.s);
  // un resultado por archivo y línea (el más grande)
  const seen = new Set(); const uniq = [];
  for (const x of similar) { const k = `${x.e.file}:${x.e.line}`; if (!seen.has(k)) { seen.add(k); uniq.push(x); } }
  json.example = { file: ex.file, line: ex.line, end: ex.end, nodes: ex.nodes, matches: uniq.map((x) => ({ file: x.e.file, line: x.e.line, end: x.e.end, similarity: Math.round(x.s * 100) / 100 })) };
  P(`## Ejemplo: \`<${ex.tag}>\` en \`${ex.file}:${ex.line}-${ex.end}\` (${ex.nodes} elementos)`);
  P('');
  P(`Bloques parecidos (similitud ≥ ${THRESHOLD}): ${uniq.length} en ${new Set(uniq.map((x) => x.e.file)).size} archivos.`);
  P('');
  P('| Similitud | Archivo | Líneas |');
  P('|---:|---|---|');
  for (const x of uniq.slice(0, 40)) P(`| ${x.s.toFixed(2)} | \`${x.e.file}\` | ${x.e.line}-${x.e.end} |`);
} else {
  // discover: bloques con la misma huella estructural en varios archivos
  const groups = new Map();
  for (const e of consumers) {
    if (e.nodes < MIN_NODES) continue;
    const fp = fingerprint(e);
    if (!groups.has(fp)) groups.set(fp, []);
    groups.get(fp).push(e);
  }
  const found = [...groups.values()]
    .map((list) => ({ list, files: new Set(list.map((e) => e.file)) }))
    .filter((g) => g.files.size >= MIN_FILES)
    .sort((x, y) => y.files.size * y.list[0].nodes - x.files.size * x.list[0].nodes);
  // quitar grupos contenidos en otros grupos mayores (mismo archivo y rango)
  const kept = [];
  for (const g of found) {
    const inside = kept.some((k) => g.list.every((e) => k.list.some((o) => o.file === e.file && o.line <= e.line && o.end >= e.end)));
    if (!inside) kept.push(g);
  }
  json.groups = kept.map((g) => ({ tag: g.list[0].tag, nodes: g.list[0].nodes, files: g.files.size, uses: g.list.map((e) => ({ file: e.file, line: e.line, end: e.end })) }));
  P(`## Bloques repetidos con la misma estructura (≥ ${MIN_NODES} elementos, en ≥ ${MIN_FILES} archivos)`);
  P('');
  if (!kept.length) P('Ninguno.');
  kept.slice(0, 25).forEach((g, i) => {
    const ex = g.list[0];
    P(`${i + 1}. \`<${ex.tag}>\` de ${ex.nodes} elementos · ${g.list.length} usos en ${g.files.size} archivos · ejemplo \`${ex.file}:${ex.line}-${ex.end}\``);
    P(`   ${[...g.files].slice(0, 8).map((f) => `\`${f.split('/').pop()}\``).join(', ')}${g.files.size > 8 ? '…' : ''}`);
  });
  P('');
  P('## Familias');
  P('');
  P('| Familia | Usos | Archivos | Componente o patrón del proyecto |');
  P('|---|---:|---:|---|');
  json.families = {};
  for (const [name, fam] of Object.entries(FAMILIES)) {
    const occ = consumers.filter((e) => fam.test(e.el));
    json.families[name] = { uses: occ.length, files: new Set(occ.map((e) => e.file)).size };
    P(`| ${fam.label} (\`${name}\`) | ${occ.length} | ${json.families[name].files} | ${fam.use} |`);
  }
  P('');
  P(`Iconos definidos localmente: ${localIcons.length} en ${new Set(localIcons.map((i) => i.file)).size} archivos.`);
}
P('');
P('## Próximo paso');
P('');
P('Leer los usos señalados, decidir con `references/decision.md` (migrar a un componente existente, ampliarlo, crear uno nuevo con aprobación o dejarlo local) y escribir el informe con `references/report.md`.');
process.stdout.write(out.join('\n') + '\n');
if (args.json) writeFileSync(resolve(args.json), JSON.stringify(json, null, 1));
