/* Results figure: two panels (Forecast-Dojo, FutureX) in the paper's Figure 1 idiom — dots with leader lines to
   ringed model icons, dashed GLM-4.5-Air → AlphaBet arrow, in-chart deltas. AlphaBet follows the paper's v12 teaser:
   an ivory badge with the project mark, a gold star at its exact score, a muted-gold arrow and deep-gold deltas. Paper orientation: Brier increases upward,
   so lower-right is better. Data: ALPHABET_DATA.main; icons: ALPHABET_LOGOS (optional). */
window.ABCompass = (function () {
  const { svg, el, clear, reducedMotion } = ABDom;
  const M = ABMath;
  const LOGO = { glm: 'glm', blf: 'blf', openforecaster: 'openforecaster', minimax: 'minimax', 'sonnet-high': 'sonnet', 'sonnet-low': 'sonnet', kimi: 'kimi', qwen: 'qwen', 'ab-free': 'alphabet' };
  // Icon offsets from the data point, in px: [dx, dy, labelSide]. Hand-placed per benchmark.
  // [dx, dy, labelPlacement, labelGap] — icon offset from the data point in px; label placement relative to the icon;
  // optional gap between an 'above' label's baseline and the ring (default 8)
  const ICON = {
    dojo: {
      'openforecaster': [36, -24, 'right'], 'glm': [-30, -38, 'above'], 'minimax': [36, -26, 'right'], 'blf': [-32, -34, 'above'],
      'sonnet-low': [0, -48, 'above'], 'kimi': [46, -36, 'right'], 'qwen': [-36, 30, 'left'], 'sonnet-high': [-40, 50, 'left'], 'ab-free': [60, 5, 'above'],
    },
    futurex: {
      'glm': [36, -32, 'right'], 'blf': [-30, -42, 'above'], 'openforecaster': [40, -22, 'right'], 'sonnet-low': [-46, 0, 'left'],
      'minimax': [-40, 30, 'left'], 'qwen': [34, -8, 'aboveleft'], 'kimi': [-44, 24, 'left'], 'sonnet-high': [42, 28, 'left'], 'ab-free': [-50, 0, 'above', 5.5],
    },
  };
  const COLORS = { 'glm': '#6B7F94', 'blf': '#6B7F94', 'openforecaster': '#6B7F94', 'minimax': '#4E968A', 'sonnet-low': '#BA765E', 'sonnet-high': '#BA765E', 'kimi': '#977293', 'qwen': '#7C83B1', 'ab-free': '#273B31' };
  const NAMES = { 'openforecaster': '+OpenForecaster', 'glm': 'GLM-4.5-Air', 'minimax': 'MiniMax-M2.5', 'blf': '+BLF', 'sonnet-low': 'Sonnet 4.6 (low)', 'kimi': 'Kimi K2.5', 'qwen': 'Qwen3.5 397B', 'sonnet-high': 'Sonnet 4.6 (high)', 'ab-free': 'AlphaBet' };
  // AlphaBet's exact score: the paper's five-point star, point up (outer radius 7, inner 0.382 of it)
  const STAR = Array.from({ length: 10 }, (_, k) => { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 7 * 0.381966 : 7;
    return `${(rr * Math.cos(a)).toFixed(2)},${(rr * Math.sin(a)).toFixed(2)}`; }).join(' ');
  function displayName(r) { return r.group === 'ours' ? 'AlphaBet · ' + r.variant : (r.variant ? `${r.name} (${r.variant})` : r.name); }

  function panel(container, bench, data, title, sub) {
    const W = 560, H = 500, m = { l: 58, r: 30, t: 70, b: 54 }, iw = W - m.l - m.r, ih = H - m.t - m.b;
    const root = el('div', { class: 'cpanel' }, container);
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'cpanel__svg', role: 'group', 'aria-label': `${title}: accuracy against Brier score for nine systems` }, root);
    const defs = svg('defs', null, s);
    const mk = svg('marker', { id: `ab-head-${bench}`, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    svg('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: 'compass__arrowhead' }, mk);
    const clip = svg('clipPath', { id: `ab-sweep-${bench}` }, defs);
    const sweep = svg('rect', { x: -W, y: 0, width: 3 * W, height: H, class: 'compass__sweep' }, clip);
    const pc = svg('clipPath', { id: `ab-plot-${bench}` }, defs);
    svg('rect', { x: m.l, y: m.t, width: iw, height: ih }, pc);
    const tip = el('div', { class: 'tip', role: 'tooltip', hidden: true }, root);

    // scales (paper orientation: higher Brier higher on screen)
    const accs = data.map(r => r[bench].acc), bri = data.map(r => r[bench].brier);
    const ax0 = Math.min(...accs), ax1 = Math.max(...accs), by0 = Math.min(...bri), by1 = Math.max(...bri);
    // domain padding (fractions of the data range): Dojo keeps extra room on the right for the AlphaBet icon and the arrow's crest
    const pad = bench === 'dojo' ? { l: .30, r: .38, b: .42, t: .30 } : { l: .30, r: .30, b: .26, t: .30 };
    const sx = M.scale(ax0 - (ax1 - ax0) * pad.l, ax1 + (ax1 - ax0) * pad.r, m.l, m.l + iw);
    const sy = M.scale(by0 - (by1 - by0) * pad.b, by1 + (by1 - by0) * pad.t, m.t + ih, m.t);

    svg('text', { x: m.l, y: 24, class: 'cp-title', text: title }, s);
    svg('text', { x: m.l, y: 44, class: 'cp-sub', text: sub }, s);
    const g = svg('g', null, s);
    M.ticks(sx.invert(m.l), sx.invert(m.l + iw), 5).forEach(v => { svg('line', { x1: sx(v), x2: sx(v), y1: m.t, y2: m.t + ih, class: 'grid' }, g); svg('text', { x: sx(v), y: m.t + ih + 20, class: 'tick', 'text-anchor': 'middle', text: v }, g); });
    M.ticks(sy.invert(m.t + ih), sy.invert(m.t), 5).forEach(v => { svg('line', { x1: m.l, x2: m.l + iw, y1: sy(v), y2: sy(v), class: 'grid' }, g); svg('text', { x: m.l - 9, y: sy(v) + 4, class: 'tick', 'text-anchor': 'end', text: v.toFixed(2) }, g); });
    svg('line', { x1: m.l, x2: m.l + iw, y1: m.t + ih, y2: m.t + ih, class: 'axis' }, g);
    svg('line', { x1: m.l, x2: m.l, y1: m.t, y2: m.t + ih, class: 'axis' }, g);
    svg('text', { x: m.l + iw / 2, y: H - 12, class: 'axis-title', 'text-anchor': 'middle', text: 'Accuracy (%) ↑' }, g);
    svg('text', { x: 15, y: m.t + ih / 2, class: 'axis-title', 'text-anchor': 'middle', transform: `rotate(-90 15 ${m.t + ih / 2})`, text: 'Brier score ↓' }, g);

    // arrow (clipped for the one-time sweep)
    const a = data.find(r => r.id === 'glm'), b = data.find(r => r.id === 'ab-free');
    const ax = sx(a[bench].acc), ay = sy(a[bench].brier), bx = sx(b[bench].acc), by = sy(b[bench].brier);
    const gArrow = svg('g', { 'clip-path': `url(#ab-sweep-${bench})` }, s);
    const f1 = n => +n.toFixed(1), pt = (x, y) => `${f1(x)} ${f1(y)}`;
    let d;
    if (bench === 'dojo') {
      // Drop from GLM, run along the row between the Qwen and Sonnet (high) icons, climb through the gap between the two
      // clusters and settle onto the AlphaBet dot from above with a low arch.
      const iconAt = id => { const r = data.find(q => q.id === id), o = ICON.dojo[id]; return [sx(r.dojo.acc) + o[0], sy(r.dojo.brier) + o[1]]; };
      const [qx, qy] = iconAt('qwen'), [hx, hy] = iconAt('sonnet-high');
      const gx = (qx + hx) / 2, gy = (qy + hy) / 2;                                   // middle of the gap between the two icons
      let ux = hy - qy, uy = qx - hx; const ul = Math.hypot(ux, uy) || 1; ux /= ul; uy /= ul; // unit direction through the gap
      if (ux < 0) { ux = -ux; uy = -uy; }                                             // pointing right (and up)
      const c0 = [ax + 8, ay + 112], c0l = Math.hypot(c0[0] - ax, c0[1] - ay) || 1;
      const s0 = [ax + (c0[0] - ax) / c0l * 9, ay + (c0[1] - ay) / c0l * 9];
      const p1 = [gx - 106, gy + 4];                                                  // bottom of the drop, entering the row
      const p2 = [gx + 30 * ux, gy + 30 * uy];                                        // through the gap
      // then a low arch: rise a little past the Sonnet (high) dot and settle onto the AlphaBet dot from above
      const end = [bx + 2, by - 14];
      d = `M ${pt(...s0)} C ${pt(...c0)} ${pt(p1[0] - 65, p1[1] - 4)} ${pt(...p1)}`
        + ` C ${pt(p1[0] + 60, p1[1] + 4)} ${pt(gx, gy)} ${pt(...p2)}`
        + ` C ${pt(p2[0] + 42 * ux, p2[1] + 42 * uy)} ${pt(bx + 9, by - 46)} ${pt(...end)}`;
    } else {
      // FutureX: arc over the top-right into the AlphaBet dot
      const tx = bx, ty = by, tr = 14, cx = bx + 150, cy = ay - 70;
      const dx = tx - cx, dy = ty - cy, len = Math.hypot(dx, dy) || 1;
      const sdx = cx - ax, sdy = cy - ay, slen = Math.hypot(sdx, sdy) || 1;
      d = `M ${pt(ax + sdx / slen * 9, ay + sdy / slen * 9)} Q ${pt(cx, cy)} ${pt(tx - dx / len * tr, ty - dy / len * tr)}`;
    }
    svg('path', { class: 'arrow', 'marker-end': `url(#ab-head-${bench})`, d }, gArrow);
    const dl = ALPHABET_DATA.teaserDeltas[bench];
    svg('text', { x: m.l + iw - 4, y: m.t + 20, class: 'cp-delta', 'text-anchor': 'end', text: `+${dl.accPP.toFixed(1)} pp accuracy` }, s);
    svg('text', { x: m.l + iw - 4, y: m.t + 40, class: 'cp-delta', 'text-anchor': 'end', text: `−${Math.abs(dl.brierRelPct).toFixed(1)}% Brier` }, s);

    // points
    // hover-only CIs: clipped to the plot, drawn under every icon and label
    const gCI = svg('g', { 'clip-path': `url(#ab-plot-${bench})` }, s);
    const gP = svg('g', null, s);
    const logos = window.ALPHABET_LOGOS || {};
    data.forEach(r => {
      const d = r[bench], x = sx(d.acc), y = sy(d.brier), off = ICON[bench][r.id] || [28, -20, 'right'];
      const grp = svg('g', { class: `pt pt--${r.group}${r.best ? ' pt--best' : ''}`, tabindex: 0, role: 'button', 'aria-label': `${displayName(r)}: accuracy ${d.acc.toFixed(1)} percent (${d.accCI[0].toFixed(1)} to ${d.accCI[1].toFixed(1)}), Brier ${d.brier.toFixed(3)} (${d.brierCI[0].toFixed(3)} to ${d.brierCI[1].toFixed(3)})`, transform: `translate(${x} ${y})` }, gP);
      const col = COLORS[r.id]; grp.style.setProperty('--c', col);
      const ci = svg('g', { class: 'ci' }, gCI); ci.style.setProperty('--c', col);
      svg('line', { x1: sx(d.accCI[0]), x2: sx(d.accCI[1]), y1: y, y2: y }, ci);
      svg('line', { x1: x, x2: x, y1: sy(d.brierCI[0]), y2: sy(d.brierCI[1]) }, ci);
      const R = r.best ? 20 : 17, ir = r.best ? 8 : 5;   // AlphaBet's leader starts clear of its star
      const L = Math.hypot(off[0], off[1]);
      svg('line', { class: 'pt__leader', x1: off[0] * ir / L, y1: off[1] * ir / L, x2: off[0] - off[0] * R / L, y2: off[1] - off[1] * R / L }, grp);
      svg('circle', { class: 'pt__hit', r: 16 }, grp);
      if (r.best) svg('polygon', { class: 'pt__star', points: STAR }, grp); else svg('circle', { class: 'pt__dot', r: ir }, grp);
      const icon = svg('g', { class: 'pt__icon', transform: `translate(${off[0]} ${off[1]})` }, grp);
      svg('circle', { class: 'pt__ring', r: R }, icon);
      const lg = logos[LOGO[r.id]];
      const sz = r.best ? 1.68 * R : 20;   // AlphaBet's mark reaches 0.84 of its badge radius, as in the paper
      if (lg) { const li = svg('svg', { viewBox: lg.viewBox, x: -sz / 2, y: -sz / 2, width: sz, height: sz, class: 'pt__logo' }, icon); li.innerHTML = lg.body; }
      else svg('text', { class: 'pt__lbl', 'text-anchor': 'middle', y: 5, text: NAMES[r.id][0] }, icon);
      const place = off[2];
      if (place === 'above') svg('text', { class: 'pt__lbl', x: off[0], y: off[1] - R - (off[3] ?? 8), 'text-anchor': 'middle', text: NAMES[r.id] }, grp);
      else if (place === 'aboveleft') svg('text', { class: 'pt__lbl', x: off[0] + R * 0.6, y: off[1] - R - 7, 'text-anchor': 'end', text: NAMES[r.id] }, grp);
      else if (place === 'aboveright') svg('text', { class: 'pt__lbl', x: off[0] - R * 0.6, y: off[1] - R - 7, 'text-anchor': 'start', text: NAMES[r.id] }, grp);
      else if (place === 'below') svg('text', { class: 'pt__lbl', x: off[0], y: off[1] + R + 16, 'text-anchor': 'middle', text: NAMES[r.id] }, grp);
      else { const lx = place === 'right' ? off[0] + R + 7 : off[0] - R - 7;
        svg('text', { class: 'pt__lbl', x: lx, y: off[1] + 5, 'text-anchor': place === 'right' ? 'start' : 'end', text: NAMES[r.id] }, grp); }
      const show = () => { grp.classList.add('is-on'); ci.classList.add('is-on');
        tip.innerHTML = `<div class="tip__name">${displayName(r)}</div><div class="tip__row"><span>Accuracy</span><b>${d.acc.toFixed(1)}%</b><i>${d.accCI[0].toFixed(1)}–${d.accCI[1].toFixed(1)}</i></div><div class="tip__row"><span>Brier</span><b>${d.brier.toFixed(3)}</b><i>${d.brierCI[0].toFixed(3)}–${d.brierCI[1].toFixed(3)}</i></div>${bench === 'dojo' ? `<div class="tip__row"><span>−Info-α</span><b>${d.negInfoAlpha.toFixed(3)}</b><i>${d.negInfoAlphaCI[0].toFixed(3)}–${d.negInfoAlphaCI[1].toFixed(3)}</i></div>` : ''}<div class="tip__note">95% CI in gray</div>`;
        tip.hidden = false; const rect = root.getBoundingClientRect(), k = rect.width / W;
        tip.style.left = Math.min(rect.width - tip.offsetWidth - 4, Math.max(4, x * k + 16)) + 'px'; tip.style.top = Math.max(0, y * k - tip.offsetHeight - 16) + 'px'; };
      const hide = () => { grp.classList.remove('is-on'); ci.classList.remove('is-on'); tip.hidden = true; };
      grp.addEventListener('mouseenter', show); grp.addEventListener('mouseleave', hide); grp.addEventListener('focus', show); grp.addEventListener('blur', hide);
      grp.addEventListener('click', show); grp.addEventListener('keydown', ev => { if (ev.key === 'Escape') hide(); });
    });
    // AlphaBet drawn last so it sits on top
    const best = gP.querySelector('.pt--best'); if (best) gP.appendChild(best);
    return { root, sweep, W, ax, bx };
  }

  function renderDotplot(container, data) {
    const dot = el('div', { class: 'compass__dotplot', role: 'list' }, container);
    ['dojo', 'futurex'].forEach(bench => {
      const rows = data.slice().sort((x, y) => x[bench].brier - y[bench].brier);
      const lo = Math.min(...rows.map(r => r[bench].brierCI[0])), hi = Math.max(...rows.map(r => r[bench].brierCI[1]));
      const sx = M.scale(lo, hi, 0, 100); const dl = ALPHABET_DATA.teaserDeltas[bench];
      el('div', { class: 'dp__delta', html: `<b>${bench === 'dojo' ? 'Forecast-Dojo' : 'FutureX'}</b> · −${Math.abs(dl.brierRelPct).toFixed(1)}% Brier · +${dl.accPP.toFixed(1)} pp accuracy <span>GLM-4.5-Air → AlphaBet</span>` }, dot);
      el('div', { class: 'dp__axis', html: `<span>Brier ${lo.toFixed(2)}</span><span>lower is better ←</span><span>${hi.toFixed(2)}</span>` }, dot);
      rows.forEach(r => { const d = r[bench];
        const row = el('div', { class: `dp__row dp__row--${r.group}${r.best ? ' dp__row--best' : ''}`, role: 'listitem' }, dot);
        el('div', { class: 'dp__name', html: `${NAMES[r.id]} <small>${d.acc.toFixed(1)}%</small>` }, row);
        const track = el('div', { class: 'dp__track' }, row);
        el('span', { class: 'dp__ci', style: { left: sx(d.brierCI[0]) + '%', width: (sx(d.brierCI[1]) - sx(d.brierCI[0])) + '%' } }, track);
        el('span', { class: 'dp__dot', style: { left: sx(d.brier) + '%' }, html: r.best ? `<svg viewBox="-8 -8 16 16" aria-hidden="true"><polygon points="${STAR}"/></svg>` : null }, track);
        el('div', { class: 'dp__v num', text: d.brier.toFixed(3) }, row); });
    });
    return dot;
  }

  function mount(container) {
    clear(container); container.classList.add('compass2');
    const data = ALPHABET_DATA.main.filter(r => r.id !== 'uniform' && !(r.group === 'ours' && !r.best));
    const grid = el('div', { class: 'compass2__grid' }, container);
    const p1 = panel(grid, 'dojo', data, 'Forecast-Dojo', '230 held-out events · 797 question-dates · March 2026 – May 2026');
    const p2 = panel(grid, 'futurex', data, 'FutureX', '343 L1–L2 questions · March 2026 – May 2026');
    const dot = renderDotplot(container, data); dot.hidden = true;
    let mobile = null;
    const layout = () => { const mb = container.clientWidth > 0 && container.clientWidth < 560; if (mb === mobile) return; mobile = mb; grid.hidden = mb; dot.hidden = !mb; };
    layout(); window.addEventListener('resize', layout, { passive: true });
    // the one load animation: the arrows sweep in once
    if (!reducedMotion() && 'IntersectionObserver' in window) {
      [p1, p2].forEach(p => { p.sweep.style.transform = `translateX(${-(p.W * 3)}px)`; });
      const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { io.disconnect(); setTimeout(() => { [p1, p2].forEach((p, i) => { p.sweep.style.transition = `transform 1100ms cubic-bezier(.22,1,.36,1) ${i * 150}ms`; p.sweep.style.transform = 'translateX(0)'; }); }, 250); } }); }, { threshold: 0.35 });
      io.observe(container);
    }
    return {};
  }
  return { mount };
})();
