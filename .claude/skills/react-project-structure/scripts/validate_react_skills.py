"""Valida la calidad estructural de las skills React del proyecto.

Uso (desde cualquier carpeta):
    python .claude/skills/react-project-structure/scripts/validate_react_skills.py

Las skills React viven en .claude/skills del proyecto. Las agnósticas que citan
(software-quality, code-metrics, mermaid-diagram-style...) viven en el
.claude/skills del workspace; se buscan en las carpetas superiores. Si no se
encuentran (por ejemplo, repo clonado solo), se avisa sin fallar.
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))  # .../.claude/skills


def skill_names(folder):
    if not os.path.isdir(folder):
        return set()
    return {d for d in os.listdir(folder) if os.path.isfile(os.path.join(folder, d, 'SKILL.md'))}


names = skill_names(ROOT)
react = sorted(n for n in names if n.startswith('react-'))

# Skills de los .claude/skills superiores (workspace).
external = set()
d = os.path.dirname(os.path.dirname(ROOT))  # carpeta que contiene .claude
while True:
    parent = os.path.dirname(d)
    if parent == d:
        break
    d = parent
    external |= skill_names(os.path.join(d, '.claude', 'skills'))

# Índice SK -> (skill, cantidad de directrices)
sk_index = {}
texts = {}
for n in react:
    t = open(os.path.join(ROOT, n, 'SKILL.md'), encoding='utf-8').read()
    texts[n] = t
    head = re.search(r'^# (SK-[^—]+)—', t, re.M).group(1).strip()
    count = len(re.findall(r'^### [A-Z_]+-\d+', t, re.M))
    for sk in [x.strip() for x in head.split('/')]:
        sk_index[sk] = (n, count)

errors = []
warnings = []
for n, t in texts.items():
    # Las skills con script declaran además argument-hint y allowed-tools.
    m = re.match(r'---\nname: (.+)\ndescription: >\n((?:  .*\n)+)(?:(?:argument-hint|allowed-tools): .*\n)*---\n', t)
    if not m:
        errors.append(f'{n}: frontmatter inválido')
        continue
    if m.group(1).strip() != n:
        errors.append(f'{n}: name "{m.group(1)}" no coincide con la carpeta')
    desc = ' '.join(l.strip() for l in m.group(2).splitlines())
    if len(desc) > 1024:
        errors.append(f'{n}: description de {len(desc)} caracteres (máx. 1024)')
    for ref in re.findall(r'\*\*`([a-z0-9-]+)`\*\*', t):
        if ref in names:
            continue
        if ref.startswith('react-'):
            errors.append(f'{n}: referencia a skill React inexistente {ref}')
        elif ref not in external:
            warnings.append(f'{n}: skill del workspace no encontrada {ref}')
    for sk, num in re.findall(r'(SK-\d{3}R)-(\d{2})', t):
        if sk not in sk_index:
            errors.append(f'{n}: cita {sk}-{num}, skill inexistente')
        elif int(num) > sk_index[sk][1]:
            errors.append(f'{n}: cita {sk}-{num}, {sk_index[sk][0]} tiene {sk_index[sk][1]} directrices')
    for sk in re.findall(r'\b(SK-\d{3}R)\b', t):
        if sk not in sk_index:
            errors.append(f'{n}: menciona {sk}, que no existe')
    body = re.sub(r'\*\*Origen:\*\*.*', '', t)
    body = re.sub(r'.*`angular-[a-z-]+`.*', '', body)
    if n == 'react-project-structure':
        body = re.sub(r'^\|.*$', '', body, flags=re.M)  # tabla de equivalencias
    for w in ['MatDialog', 'TestBed', 'signal(', 'computed(', 'inject(', 'standalone', 'NgRx', 'RxJS', '.spec.ts', 'HttpClient']:
        if w in body:
            errors.append(f'{n}: resto de Angular "{w}"')
    if 'cuando exista' in t:
        errors.append(f'{n}: referencia pendiente "cuando exista"')
    if re.search(r'[A-Za-z]:\\\\Users|/Users/|Documents\\\\', t):
        errors.append(f'{n}: ruta absoluta de un equipo')

print('skills React:', ', '.join(react))
print('índice SK:', {k: v[0] for k, v in sorted(sk_index.items())})
for w in sorted(set(warnings)):
    print('aviso:', w)
if errors:
    print('\n'.join(errors))
    sys.exit(1)
print('OK: sin errores')
