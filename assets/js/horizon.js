/* Brier by days to settlement: base model vs AlphaBet trained on one date per event vs on every date (memory-free). */
window.ABHorizon = (function () {
  const { el, svg, clear } = ABDom; const M = ABMath;
  function mount(container) {
    const bins = ALPHABET_DATA.horizon.slice().reverse(); // >14d first → <3d last (time flows toward settlement)
    clear(container); container.classList.add('horizon');
    const W = 760, H = 392, m = { l: 64, r: 44, t: 40, b: 66 }, iw = W - m.l - m.r, ih = H - m.t - m.b;
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'horizon__svg', role: 'group', 'aria-label': 'Brier score by days to settlement for GLM-4.5-Air, AlphaBet single-date, and AlphaBet memory-free' }, container);
    const tip = el('div', { class: 'tip', role: 'tooltip', hidden: true }, container);
    const clip = svg('clipPath', { id: 'hz-clip' }, svg('defs', null, s));
    svg('rect', { x: m.l, y: m.t - 6, width: iw, height: ih + 12 }, clip);
    // domain from the point estimates (the hover-only CIs are clipped to the plot), so the plot is not mostly empty
    const allV = bins.flatMap(b => [b.base, b.single, b.free]);
    const y0 = Math.floor((Math.min(...allV) - 0.02) * 20) / 20, y1 = Math.ceil((Math.max(...allV) + 0.02) * 20) / 20;
    const sy = M.scale(y0, y1, m.t + ih, m.t); // paper orientation: higher Brier higher on screen
    const sx = i => m.l + iw * (i + 0.5) / bins.length;
    M.ticks(y0, y1, 5).forEach(v => { svg('line', { x1: m.l, x2: m.l + iw, y1: sy(v), y2: sy(v), class: 'grid' }, s); svg('text', { x: m.l - 10, y: sy(v) + 4, class: 'tick', 'text-anchor': 'end', text: v.toFixed(2) }, s); });
    svg('text', { x: 16, y: m.t + ih / 2, class: 'axis-title', 'text-anchor': 'middle', transform: `rotate(-90 16 ${m.t + ih / 2})`, text: 'Brier score ↓' }, s);
    svg('text', { x: m.l + iw / 2, y: H - 6, class: 'axis-title', 'text-anchor': 'middle', text: 'Days to settlement' }, s);

    // longitudinal gain band between single-date and memory-free
    const band = svg('path', { class: 'horizon__band' }, s);
    band.setAttribute('d', 'M ' + bins.map((b, i) => `${sx(i)} ${sy(b.single)}`).join(' L ') + ' L ' + bins.slice().reverse().map((b, i) => `${sx(bins.length - 1 - i)} ${sy(b.free)}`).join(' L ') + ' Z');

    const series = [
      { key: 'base', ciKey: 'baseCI', cls: 'base', label: 'GLM-4.5-Air' },
      { key: 'single', ciKey: 'singleCI', cls: 'single', label: 'AlphaBet · single-date' },
      { key: 'free', ciKey: 'freeCI', cls: 'free', label: 'AlphaBet · memory-free' },
    ];
    series.forEach(sr => {
      svg('path', { class: `horizon__line horizon__line--${sr.cls}`, d: 'M ' + bins.map((b, i) => `${sx(i)} ${sy(b[sr.key])}`).join(' L ') }, s);
    });
    const cols = bins.map((b, i) => {
      const g = svg('g', { class: 'horizon__col', tabindex: 0, role: 'button', 'aria-label': `${b.label}: base ${b.base.toFixed(3)}, single-date ${b.single.toFixed(3)}, memory-free ${b.free.toFixed(3)}; n = ${b.n}` }, s);
      svg('rect', { x: sx(i) - iw / bins.length / 2, y: m.t, width: iw / bins.length, height: ih, class: 'horizon__hit' }, g);
      const ciG = svg('g', { 'clip-path': 'url(#hz-clip)' }, g);
      series.forEach(sr => {
        svg('line', { class: `horizon__ci horizon__ci--${sr.cls}`, x1: sx(i), x2: sx(i), y1: sy(b[sr.ciKey][0]), y2: sy(b[sr.ciKey][1]) }, ciG);
      });
      // value labels placed by hand per series and bin so none sits on a line: a = above, b = below, l/r = beside
      const PLACE = { base: ['a', 'b', 'a', 'a2'], single: ['ar', 'b', 'ar', 'r'], free: ['b', 'b', 'bb', 'b'] };
      const POS = { a: [0, -11, 'middle'], a2: [0, -13, 'middle'], b: [0, 19, 'middle'], bb: [0, 33, 'middle'], r: [12, 4.5, 'start'], l: [-12, 4.5, 'end'], ar: [9, -8, 'start'], al: [-9, -8, 'end'], br: [9, 17, 'start'] };
      series.forEach(sr => {
        svg('circle', { class: `horizon__dot horizon__dot--${sr.cls}`, cx: sx(i), cy: sy(b[sr.key]), r: sr.cls === 'free' ? 6 : 5 }, g);
        const [dx, dy, anchor] = POS[PLACE[sr.cls][i]];
        svg('text', { class: `horizon__val num horizon__val--${sr.cls}`, x: sx(i) + dx, y: sy(b[sr.key]) + dy, 'text-anchor': anchor, text: b[sr.key].toFixed(3) }, g);
      });
      svg('text', { class: 'horizon__xlbl', x: sx(i), y: m.t + ih + 22, 'text-anchor': 'middle', text: b.label.replace('< 3', 'under 3').replace('> 14', 'over 14') }, g);
      svg('text', { class: 'horizon__n num', x: sx(i), y: m.t + ih + 40, 'text-anchor': 'middle', text: `n = ${b.n}` }, g);
      const show = () => {
        g.classList.add('is-on');
        tip.innerHTML = `<div class="tip__name">${b.label.replace('< 3', 'Under 3').replace('> 14', 'Over 14')} to settlement · n = ${b.n}</div>` +
          series.map(sr => `<div class="tip__row"><span>${sr.label}</span><b>${b[sr.key].toFixed(3)}</b><i>${b[sr.ciKey][0].toFixed(3)}–${b[sr.ciKey][1].toFixed(3)}</i></div>`).join('') +
          `<div class="tip__note">Memory-free minus single-date: −${b.longGain.toFixed(3)} Brier</div>`;
        tip.hidden = false;
        const rect = container.getBoundingClientRect(), k = rect.width / W;
        tip.style.left = (i >= bins.length / 2 ? Math.max(8, sx(i) * k - tip.offsetWidth - 14) : Math.min(rect.width - tip.offsetWidth - 8, sx(i) * k + 14)) + 'px';
        tip.style.top = Math.max(0, sy(b.free) * k - tip.offsetHeight - 16) + 'px';
      };
      const hide = () => { g.classList.remove('is-on'); tip.hidden = true; };
      g.addEventListener('mouseenter', show); g.addEventListener('mouseleave', hide); g.addEventListener('focus', show); g.addEventListener('blur', hide);
      g.addEventListener('keydown', ev => { if (ev.key === 'Escape') hide(); });
      return g;
    });
    // the warm 'settles' tick at the right edge, rhyming with the hero timeline
    svg('line', { x1: m.l + iw + 14, x2: m.l + iw + 14, y1: m.t + ih - 10, y2: m.t + ih + 6, class: 'horizon__settle' }, s);
    svg('text', { x: m.l + iw + 14, y: m.t + ih + 22, class: 'horizon__settlelbl', 'text-anchor': 'middle', text: 'settles' }, s);
    // legend: the three items span the plot width with equal gaps (first flush left, last flush right)
    const lg = svg('g', { class: 'horizon__legend' }, s);
    const items = series.map(sr => { const g = svg('g', null, lg);
      svg('circle', { cx: 6, cy: 0, r: 5, class: `horizon__dot horizon__dot--${sr.cls}` }, g);
      const t = svg('text', { x: 17, y: 4.5, class: 'legend', text: sr.label }, g);
      return { g, w: 17 + (t.getComputedTextLength ? t.getComputedTextLength() : sr.label.length * 7.6) }; });
    const gapL = (iw - items.reduce((a, it) => a + it.w, 0)) / (items.length - 1); let lx = m.l;
    items.forEach(it => { it.g.setAttribute('transform', `translate(${lx}, ${m.t - 20})`); lx += it.w + gapL; });
    return {};
  }
  return { mount };
})();
