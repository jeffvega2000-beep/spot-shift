// Reglas puras: las usan el juego y el generador de niveles.
// # pared · . piso · L solo con luna · D solo en sombra · h hueso · S inicio · G cama · T gato (da un paso al costado en cada Shift y regresa)
(function (raiz) {
  const DIR = { izq: [-1, 0], der: [1, 0], arr: [0, -1], aba: [0, 1] };
  function leer(filas) {
    const n = { w: filas[0].length, h: filas.length, c: [], huesos: [], gatos: [] };
    filas.forEach((f, y) => [...f].forEach((ch, x) => {
      if (ch === 'S') n.inicio = [x, y];
      if (ch === 'G') n.meta = [x, y];
      if (ch === 'h') n.huesos.push([x, y]);
      if (ch === 'T') n.gatos.push([x, y]);
      n.c.push('SGhT'.includes(ch) ? '.' : ch);
    }));
    return n;
  }
  const celda = (n, x, y) => (x < 0 || y < 0 || x >= n.w || y >= n.h ? '#' : n.c[y * n.w + x]);
  const inicial = n => ({ x: n.inicio[0], y: n.inicio[1], luna: true, huesos: 0, cambios: 0, pasos: 0 });
  // el gato esta en su lugar con luna y un paso a la derecha en sombra
  const gatos = (n, luna) => n.gatos.map(([x, y]) => [luna ? x : x + 1, y]);
  function pisable(n, x, y, luna) {
    const c = celda(n, x, y);
    if (c === '#' || (c === 'L' && !luna) || (c === 'D' && luna)) return false;
    return !gatos(n, luna).some(g => g[0] === x && g[1] === y);
  }
  function mover(n, e, d) {
    const x = e.x + DIR[d][0], y = e.y + DIR[d][1];
    if (!pisable(n, x, y, e.luna)) return null;
    const i = n.huesos.findIndex(h => h[0] === x && h[1] === y);
    return { ...e, x, y, pasos: e.pasos + 1, huesos: i >= 0 ? e.huesos | (1 << i) : e.huesos };
  }
  // no se puede cambiar si Spot se quedaria sin piso o un gato le caeria encima
  function shift(n, e) {
    return pisable(n, e.x, e.y, !e.luna) ? { ...e, luna: !e.luna, cambios: e.cambios + 1 } : null;
  }
  const gano = (n, e) => e.x === n.meta[0] && e.y === n.meta[1] && e.huesos === (1 << n.huesos.length) - 1;
  // menos cambios primero (0-1 BFS); devuelve null si no tiene solucion
  function resolver(n) {
    const clave = e => `${e.x},${e.y},${e.luna ? 1 : 0},${e.huesos}`;
    const cola = [{ e: inicial(n), v: '' }], visto = new Set();
    while (cola.length) {
      const { e, v } = cola.shift();
      if (visto.has(clave(e))) continue;
      visto.add(clave(e));
      if (gano(n, e)) return { cambios: e.cambios, pasos: e.pasos, via: v, estados: visto.size };
      for (const d in DIR) { const s = mover(n, e, d); if (s && !visto.has(clave(s))) cola.unshift({ e: s, v: v + d[0] }); }
      const s = shift(n, e); if (s && !visto.has(clave(s))) cola.push({ e: s, v: v + 'S' });
    }
    return null;
  }
  const api = { leer, inicial, mover, shift, gano, resolver, gatos, celda, pisable, DIR };
  if (typeof module !== 'undefined') module.exports = api; else raiz.Reglas = api;
})(this);
