// node generar.js  → niveles.js (siempre los mismos: semilla fija). Cada nivel se comprueba con resolver().
const fs = require('fs'), path = require('path'), R = require('./reglas.js');
let s = 20261123; const az = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
const ent = n => Math.floor(az() * n);
// [ancho, alto, huesos, gatos, cambios minimos, cambios maximos]
const PLAN = [[7, 5, 0, 0, 1, 1], [8, 6, 1, 0, 2, 2], [9, 6, 1, 0, 3, 4], [9, 7, 2, 0, 4, 5], [9, 7, 1, 1, 4, 6],
  [10, 7, 2, 1, 5, 7], [11, 8, 2, 2, 6, 8], [11, 8, 3, 2, 7, 10], [12, 8, 3, 2, 8, 12], [12, 8, 3, 3, 9, 16]];
const sal = [];
PLAN.forEach(([w, h, nh, ng, min, max], k) => {
  let mejor = null;
  for (let t = 0; t < 60000; t++) {
    const g = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => {
      if (!x || !y || x === w - 1 || y === h - 1) return '#';
      const r = az(); return r < 0.2 ? '#' : r < 0.4 ? 'L' : r < 0.6 ? 'D' : '.';
    }));
    const libres = () => { const l = []; g.forEach((f, y) => f.forEach((c, x) => { if (c === '.') l.push([x, y]); })); return l; };
    const poner = ch => { const l = libres(); if (!l.length) return false; const [x, y] = l[ent(l.length)]; g[y][x] = ch; return true; };
    if (![...'SG', ...'h'.repeat(nh)].every(poner)) continue;
    let ok = true;
    for (let i = 0; i < ng && ok; i++) {
      const l = libres().filter(([x, y]) => g[y][x + 1] === '.');
      if (!l.length) ok = false; else { const [x, y] = l[ent(l.length)]; g[y][x] = 'T'; }
    }
    if (!ok) continue;
    const filas = g.map(f => f.join('')), n = R.leer(filas), r = R.resolver(n);
    if (!r || r.cambios < min || r.cambios > max) continue;
    // si hay gatos, que importen: sin ellos la solucion debe ser distinta
    if (ng) { const r2 = R.resolver(R.leer(filas.map(f => f.replace(/T/g, '.')))); if (r2 && r2.cambios === r.cambios) continue; }
    const nota = r.cambios * 10 + r.estados * 0.1;
    if (!mejor || nota > mejor.nota) mejor = { filas, nota, cambios: r.cambios };
  }
  if (!mejor) throw new Error('sin nivel ' + (k + 1));
  sal.push({ filas: mejor.filas, minimo: mejor.cambios });
  console.log(k + 1, 'cambios', mejor.cambios); console.log(mejor.filas.join('\n'));
});
fs.writeFileSync(path.join(__dirname, 'niveles.js'), 'var NIVELES = ' + JSON.stringify(sal, null, 1) + ';\nif (typeof module !== "undefined") module.exports = NIVELES;\n');
