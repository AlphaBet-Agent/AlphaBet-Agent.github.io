/* GRPO std vs no-std at step 39: dumbbell rows for Brier, reliability, mean max probability, entropy; reward toggle. */
window.ABGrpoDiag = (function () {
  const { el, svg, clear, tween, segmented } = ABDom; const M = ABMath;
  const ROWS = [
    { key: 'rel', label: 'Reliability (REL)', sub: 'Murphy calibration term · lower is better', dom: [0, 0.12], fmt: v => v.toFixed(3), better: 'low' },
    { key: 'meanMaxProb', label: 'Mean max probability', sub: 'confidence in the favorite', dom: [0.3, 0.8], fmt: v => v.toFixed(3), better: null },
    { key: 'entropy', label: 'Predictive entropy', sub: 'nats · higher means more spread', dom: [0.6, 1.6], fmt: v => v.toFixed(3), better: null },
  ];
  function mount(container) {
    let reward = 'brierReward';
    clear(container); container.classList.add('gdiag');
    const head = el('div', { class: 'gdiag__head' }, container);
    const seg = segmented([{ id: 'brierReward', label: 'Brier reward' }, { id: 'logReward', label: 'Log-score reward' }], reward, id => { reward = id; render(); }, '', 'Training reward');
    head.appendChild(seg.root);
    const legend = el('div', { class: 'gdiag__legend', html: '<span class="gdiag__key gdiag__key--std"></span> with std normalization <span class="gdiag__key gdiag__key--nostd"></span> without std normalization' }, head);
    const W = 1120, rowH = 60, m = { l: 290, r: 44, t: 12, b: 6 }, H = m.t + m.b + rowH * ROWS.length, iw = W - m.l - m.r;
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'gdiag__svg', role: 'img', 'aria-label': 'Diagnostics comparing GRPO with and without standard-deviation normalization' }, container);
    const items = ROWS.map((r, i) => {
      const y = m.t + rowH * i + rowH / 2;
      svg('text', { x: m.l - 16, y: y - 4, class: 'gdiag__label', 'text-anchor': 'end', text: r.label }, s);
      svg('text', { x: m.l - 16, y: y + 12, class: 'gdiag__sub', 'text-anchor': 'end', text: r.sub }, s);
      svg('line', { x1: m.l, x2: m.l + iw, y1: y, y2: y, class: 'gdiag__track' }, s);
      const link = svg('line', { y1: y, y2: y, class: 'gdiag__link' }, s);
      const dStd = svg('circle', { cy: y, r: 7, class: 'gdiag__dot gdiag__dot--std' }, s);
      const dNo = svg('circle', { cy: y, r: 7, class: 'gdiag__dot gdiag__dot--nostd' }, s);
      const tStd = svg('text', { y: y - 12, class: 'gdiag__val gdiag__val--std num', 'text-anchor': 'middle' }, s);
      const tNo = svg('text', { y: y + 24, class: 'gdiag__val gdiag__val--nostd num', 'text-anchor': 'middle' }, s);
      return { r, sx: M.scale(r.dom[0], r.dom[1], m.l, m.l + iw), link, dStd, dNo, tStd, tNo, cur: null };
    });
    function render() {
      const D = ALPHABET_DATA.grpo[reward];
      items.forEach(it => {
        const a = D[it.r.key].std, b = D[it.r.key].noStd, from = it.cur || [a, b];
        tween(0, 1, 420, t => {
          const va = from[0] + (a - from[0]) * t, vb = from[1] + (b - from[1]) * t;
          const xa = it.sx(va), xb = it.sx(vb);
          it.dStd.setAttribute('cx', xa); it.dNo.setAttribute('cx', xb);
          it.link.setAttribute('x1', xa); it.link.setAttribute('x2', xb);
          it.tStd.setAttribute('x', xa); it.tStd.textContent = it.r.fmt(va);
          it.tNo.setAttribute('x', xb); it.tNo.textContent = it.r.fmt(vb);
        });
        it.cur = [a, b];
      });
      const G = ALPHABET_DATA.grpo;
    }
    render();
    return {};
  }
  return { mount };
})();
