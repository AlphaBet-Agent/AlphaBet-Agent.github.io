/* Full main-results table rendered from data (Table 1). */
window.ABTable = (function () {
  const { el, clear } = ABDom;
  function cell(tr, v, ci, opts) {
    const td = el('td', { class: 'num' + (opts && opts.cls ? ' ' + opts.cls : '') }, tr);
    el('span', { class: 'rt__v' + (opts && opts.best ? ' rt__best' : '') + (opts && opts.second ? ' rt__second' : ''), text: typeof v === 'number' ? (opts && opts.pct ? v.toFixed(1) : v.toFixed(3)) : v }, td);
    if (ci) el('span', { class: 'rt__ci', text: (opts && opts.pct ? `${ci[0].toFixed(1)}–${ci[1].toFixed(1)}` : `${ci[0].toFixed(3)}–${ci[1].toFixed(3)}`) }, td);
  }
  function mount(container) {
    clear(container);
    const rows = ALPHABET_DATA.main;
    const glmBlock = rows.filter(r => ['base', 'baseline', 'ours'].includes(r.group));
    const metrics = [
      { b: 'dojo', k: 'acc', ci: 'accCI', dir: 'high', pct: true }, { b: 'dojo', k: 'brier', ci: 'brierCI', dir: 'low' }, { b: 'dojo', k: 'negInfoAlpha', ci: 'negInfoAlphaCI', dir: 'low' },
      { b: 'futurex', k: 'acc', ci: 'accCI', dir: 'high', pct: true }, { b: 'futurex', k: 'brier', ci: 'brierCI', dir: 'low' },
    ];
    const rank = {};
    metrics.forEach(mt => {
      const sorted = glmBlock.slice().sort((a, b) => mt.dir === 'high' ? b[mt.b][mt.k] - a[mt.b][mt.k] : a[mt.b][mt.k] - b[mt.b][mt.k]);
      rank[mt.b + mt.k] = { best: sorted[0].id, second: sorted[1].id };
    });
    const tbl = el('table', { class: 'rt' }, container);
    const thead = el('thead', null, tbl);
    const h1 = el('tr', null, thead);
    el('th', { rowspan: 2, text: 'Model', class: 'rt__model' }, h1);
    el('th', { colspan: 3, text: 'Forecast-Dojo', class: 'rt__group' }, h1);
    el('th', { colspan: 2, text: 'FutureX', class: 'rt__group' }, h1);
    const h2 = el('tr', null, thead);
    ['Acc. (%) ↑', 'Brier ↓', '−Info-α ↓', 'Acc. (%) ↑', 'Brier ↓'].forEach(t => el('th', { text: t, class: 'num' }, h2));
    const tb = el('tbody', null, tbl);
    const SECTION = { ref: 'off', frontier: 'off', base: 'glm', baseline: 'glm', ours: 'glm' };
    const SECTION_LABEL = { off: 'Off-the-shelf models', glm: 'GLM-4.5-Air base and trained variants' };
    let lastSection = null;
    rows.forEach(r => {
      const sec = SECTION[r.group];
      if (sec !== lastSection) {
        const sr = el('tr', { class: `rt__section rt__section--${sec}` }, tb);
        el('th', { scope: 'rowgroup', colspan: 1 + metrics.length, html: '<span>' + SECTION_LABEL[sec] + '</span>' }, sr);
        lastSection = sec;
      }
      const tr = el('tr', { class: `rt__row rt__row--${r.group}` + (r.best ? ' rt__row--best' : ''), 'data-group': r.group }, tb);
      const name = el('th', { scope: 'row', class: 'rt__name' + (r.name.startsWith('+') ? ' rt__name--indent' : '') }, tr);
      el('span', { text: r.name }, name);
      if (r.variant) el('span', { class: 'rt__variant', text: r.variant }, name);
      metrics.forEach(mt => {
        const inBlock = ['base', 'baseline', 'ours'].includes(r.group);
        cell(tr, r[mt.b][mt.k], r[mt.b][mt.ci], { pct: mt.pct, best: inBlock && rank[mt.b + mt.k].best === r.id, second: inBlock && rank[mt.b + mt.k].second === r.id });
      });
    });
    el('p', { class: 'rt__foot', html: 'Gray ranges are 95% confidence intervals (event-clustered bootstrap for <span class="nobr">Forecast-Dojo</span>, item bootstrap for FutureX). Bold and underline mark the best and second-best point estimates within the <span class="nobr">GLM-4.5-Air</span> block.' }, container);
  }
  return { mount };
})();
