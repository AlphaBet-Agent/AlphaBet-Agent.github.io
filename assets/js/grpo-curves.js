/* GRPO ablation training curves, redrawn natively from ALPHABET_CURVES (digitized from the paper's figure).
   Falls back to the recolored paper SVG if the digitized data is unavailable. */
window.ABCurves = (function () {
  const { el, svg, clear } = ABDom; const M = ABMath;
  const COLS = [
    { key: 'brier', title: 'Brier score ↓', fmt: v => v.toFixed(3) },
    { key: 'logProb', title: 'Log score ↑', fmt: v => v.toFixed(3).replace('-', '−') },   // true minus sign, as elsewhere on the page
    { key: 'acc', title: 'Accuracy ↑', fmt: v => v.toFixed(3) },
  ];
  const ROWS = [{ key: 'brierReward', title: 'Brier reward' }, { key: 'logReward', title: 'Log-score reward' }];
  function mount(container) {
    clear(container); container.classList.add('curves');
    const C = window.ALPHABET_CURVES;
    if (!C) { const img = el('img', { src: 'assets/figures/std_vs_nostd.svg', alt: 'Training curves with and without GRPO std normalization.', loading: 'lazy' }, container); return {}; }
    const W = 1120, pw = 254, gut = 56, gx = 48, ph = 176, gy = 46, top = 58, left = 92;   // each column: plot + a label gutter
    const H = top + ROWS.length * (ph + gy) + 4;
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'curves__svg', role: 'img', 'aria-label': 'Training curves over 39 rollout steps: with standard-deviation normalization both proper scores worsen while accuracy stays comparable; without it both improve.' }, container);
    const steps = C.steps, sx0 = 0, sx1 = steps[steps.length - 1];
    // legend: two items, centred over the drawing
    const spanL = left, spanR = left + 2 * (pw + gut + gx) + pw, spanC = (spanL + spanR) / 2;   // first plot's left edge to last plot's right edge
    const lg = svg('g', null, s);
    const mk = (cls, label, x) => { const g = svg('g', { transform: `translate(${x} 0)` }, lg);
      svg('line', { x1: 0, x2: 26, y1: 0, y2: 0, class: `cv-line cv-line--${cls}` }, g); svg('circle', { cx: 13, cy: 0, r: 3.5, class: `cv-dot--${cls}` }, g);
      const t = svg('text', { x: 34, y: 4.5, class: 'cv-legend', text: label }, g);
      return { g, w: 34 + (t.getComputedTextLength ? t.getComputedTextLength() : label.length * 7.4) }; };
    const a = mk('std', 'with std normalization', 0), b = mk('nostd', 'without std normalization', 0);
    const gap = 44, total = a.w + gap + b.w, start = spanC - total / 2;
    a.g.setAttribute('transform', `translate(${start} 0)`); b.g.setAttribute('transform', `translate(${start + a.w + gap} 0)`);
    lg.setAttribute('transform', 'translate(0 14)');
    ROWS.forEach((row, ri) => {
      const y0 = top + ri * (ph + gy);
      svg('text', { x: 14, y: y0 + ph / 2, class: 'cv-row', 'text-anchor': 'middle', transform: `rotate(-90 14 ${y0 + ph / 2})`, text: row.title }, s);
      COLS.forEach((col, ci) => {
        const x0 = left + ci * (pw + gut + gx);
        const d = C[row.key][col.key]; const all = [...d.std, ...d.noStd];
        const lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.18;
        const sx = M.scale(sx0, sx1, x0, x0 + pw), sy = M.scale(lo - pad, hi + pad, y0 + ph, y0);
        if (ri === 0) svg('text', { x: x0 + pw / 2, y: y0 - 12, class: 'cv-title', 'text-anchor': 'middle', text: col.title }, s);
        M.ticks(lo - pad, hi + pad, 4).forEach(v => { svg('line', { x1: x0, x2: x0 + pw, y1: sy(v), y2: sy(v), class: 'grid' }, s); svg('text', { x: x0 - 8, y: sy(v) + 4, class: 'tick', 'text-anchor': 'end', text: (col.key === 'logProb' ? v.toFixed(2) : v.toFixed(col.key === 'acc' ? 2 : 3)).replace('-', '−') }, s); });
        [0, 10, 20, 30, 39].forEach(v => svg('text', { x: sx(v), y: y0 + ph + 18, class: 'tick', 'text-anchor': 'middle', text: v }, s));
        svg('line', { x1: x0, x2: x0 + pw, y1: y0 + ph, y2: y0 + ph, class: 'axis' }, s);
        // shaded gap between the two series
        const fill = svg('path', { class: 'cv-fill', d: 'M ' + steps.map((st, i) => `${sx(st)} ${sy(d.std[i])}`).join(' L ') + ' L ' + steps.slice().reverse().map((st, i) => `${sx(st)} ${sy(d.noStd[steps.length - 1 - i])}`).join(' L ') + ' Z' }, s);
        ['std', 'noStd'].forEach(k => {
          svg('path', { class: `cv-line cv-line--${k === 'std' ? 'std' : 'nostd'}`, d: 'M ' + steps.map((st, i) => `${sx(st)} ${sy(d[k][i])}`).join(' L ') }, s);
          steps.forEach((st, i) => svg('circle', { cx: sx(st), cy: sy(d[k][i]), r: 3, class: `cv-dot--${k === 'std' ? 'std' : 'nostd'}` }, s));
        });
        // end-of-training values in the gutter right of the plot: level with their points, pushed apart when they would touch,
        // and kept inside the plot's vertical extent
        const yS = sy(d.std[steps.length - 1]), yN = sy(d.noStd[steps.length - 1]);
        let lS = yS + 4.5, lN = yN + 4.5;
        if (Math.abs(yS - yN) < 17) { const mid = (yS + yN) / 2; if (yS <= yN) { lS = mid - 4; lN = mid + 13; } else { lN = mid - 4; lS = mid + 13; } }
        const clampY = v => Math.max(y0 + 11, Math.min(y0 + ph - 1, v));
        svg('text', { x: x0 + pw + 12, y: clampY(lS), class: 'cv-end cv-end--std', text: col.fmt(d.std[steps.length - 1]) }, s);
        svg('text', { x: x0 + pw + 12, y: clampY(lN), class: 'cv-end cv-end--nostd', text: col.fmt(d.noStd[steps.length - 1]) }, s);
      });
      if (ri === ROWS.length - 1) svg('text', { x: spanC, y: y0 + ph + 42, class: 'axis-title', 'text-anchor': 'middle', text: 'Training rollout step' }, s);
    });
    return {};
  }
  return { mount };
})();
