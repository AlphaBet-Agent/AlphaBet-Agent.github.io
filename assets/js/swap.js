/* Evidence × reader swap (the paper's gain analysis). The 4 × 3 table is the control: click any cell, or use the two
   swap buttons in the readout, and watch Brier move. Columns: who gathered the frozen evidence; rows: who read it. */
window.ABSwap = (function () {
  const { el, clear, tween } = ABDom;
  const G = () => ALPHABET_DATA.gain;
  const EV = [
    { id: 'hBase', label: 'Base agent', who: 'articles the base agent retrieved' },
    { id: 'hAB', label: 'AlphaBet agent', who: 'articles the trained agent retrieved' },
    { id: 'none', label: 'None', who: 'the question only' },
  ];
  const RD = [
    { id: 'glm', label: 'GLM-4.5-Air', sub: 'base' },
    { id: 'ab', label: 'AlphaBet', sub: 'trained' },
    { id: 'gpt', label: 'GPT-5.6 Terra', sub: 'xhigh' },
    { id: 'sonnet', label: 'Sonnet 4.6', sub: 'high' },
  ];
  const sig = s => s ? `<sup>${s}</sup>` : '';

  function mount(container) {
    let ev = 'hBase', rd = 'glm';
    clear(container); container.classList.add('swap');
    const grid = el('div', { class: 'swap__grid' }, container);

    /* ---- the table (controls) ---- */
    const wrap = el('div', { class: 'swap__tablewrap' }, grid);
    const tbl = el('table', { class: 'swap__table num' }, wrap);
    const cg = el('colgroup', null, tbl); ['31%', '17.25%', '17.25%', '17.25%', '17.25%'].forEach(wd => el('col', { style: { width: wd } }, cg));
    const thead = el('thead', null, tbl);
    const h0 = el('tr', null, thead);
    el('th', null, h0); el('th', { colspan: 3, class: 'swap__axis', text: 'Evidence gathered by →' }, h0); el('th', null, h0);
    const h1 = el('tr', null, thead);
    el('th', { text: 'Reader ↓', class: 'swap__axis' }, h1);
    EV.forEach(e => el('th', { text: e.label, scope: 'col' }, h1));
    el('th', { html: 'Δ<sub>evidence</sub>', scope: 'col', class: 'swap__delta-col' }, h1);
    const tbody = el('tbody', null, tbl);
    const cells = {};
    RD.forEach(r => {
      const row = G().readers.find(x => x.id === r.id);
      const tr = el('tr', null, tbody);
      el('th', { scope: 'row', html: `${r.label}<small>${r.sub}</small>` }, tr);
      EV.forEach(e => {
        const td = el('td', null, tr);
        const b = el('button', { type: 'button', class: 'swap__cell', text: row[e.id].toFixed(3), 'aria-label': `${r.label} reading ${e.label === 'None' ? 'no evidence' : 'the ' + e.label + '’s articles'}: Brier ${row[e.id].toFixed(3)}` }, td);
        b.addEventListener('click', () => { ev = e.id; rd = r.id; render(); });
        cells[r.id + '|' + e.id] = b;
      });
      el('td', { class: 'swap__delta-col', html: `−${row.dAcq.toFixed(3)}${sig(row.dAcqSig)}` }, tr);
    });
    const tfoot = el('tfoot', null, tbl); const fr = el('tr', null, tfoot);
    el('th', { scope: 'row', html: 'Δ<sub>reader</sub> · base → AlphaBet' }, fr);
    ['hBase', 'hAB', 'none'].forEach(k => el('td', { html: `−${G().dReport[k].v.toFixed(3)}${sig(G().dReport[k].sig)}` }, fr));
    el('td', null, fr);

    /* ---- the readout ---- */
    const out = el('div', { class: 'swap__readout' }, grid);
    el('div', { class: 'swap__metric', text: 'Brier · Forecast-Dojo · lower is better' }, out);
    const big = el('div', { class: 'swap__big num', text: '0.702', 'aria-hidden': 'true' }, out);
    const live = el('div', { class: 'visually-hidden', 'aria-live': 'polite' }, out);
    const ciEl = el('div', { class: 'swap__ci num' }, out);
    const who = el('div', { class: 'swap__who' }, out);
    const deltas = el('div', { class: 'swap__deltas' }, out);
    const bEv = el('button', { type: 'button', class: 'swap__delta' }, deltas);
    const bRd = el('button', { type: 'button', class: 'swap__delta' }, deltas);
    bEv.addEventListener('click', () => { if (ev === 'none') return; ev = ev === 'hBase' ? 'hAB' : 'hBase'; render(); });
    bRd.addEventListener('click', () => { if (rd !== 'glm' && rd !== 'ab') return; rd = rd === 'glm' ? 'ab' : 'glm'; render(); });
    el('p', { class: 'swap__foot', html: '<sup>*</sup> p &lt; .05 · <sup>**</sup> p &lt; .01 · <sup>***</sup> p &lt; .001' }, container);

    let shown = 0.702;
    function render() {
      const row = G().readers.find(x => x.id === rd), val = row[ev], ci = row[ev + 'CI'];
      tween(shown, val, 420, v => { big.textContent = v.toFixed(3); }); shown = val;
      const r = RD.find(o => o.id === rd), e = EV.find(o => o.id === ev);
      live.textContent = `Brier ${val.toFixed(3)}: ${r.label} reading ${e.who}`;
      ciEl.textContent = `95% CI ${ci[0].toFixed(3)}–${ci[1].toFixed(3)}`;
      who.innerHTML = `<b>${r.label}</b> reads <b>${e.who}</b>`;
      // what each swap would do from here
      if (ev === 'none') { bEv.disabled = true; bEv.innerHTML = `<span class="swap__dk">Swap the evidence<small>no articles in this column</small></span>`; }
      else { const toAB = ev === 'hBase'; bEv.disabled = false; bEv.className = 'swap__delta' + (toAB ? '' : ' is-bad');
        bEv.innerHTML = `<span class="swap__dk">Swap the evidence<small>${toAB ? 'give this reader AlphaBet’s articles' : 'give this reader the base agent’s articles'}</small></span><b>${toAB ? '−' : '+'}${row.dAcq.toFixed(3)}${sig(row.dAcqSig)}</b>`; }
      if (rd === 'glm' || rd === 'ab') { const d = G().dReport[ev], toAB = rd === 'glm'; bRd.disabled = false; bRd.className = 'swap__delta' + (toAB ? '' : ' is-bad');
        bRd.innerHTML = `<span class="swap__dk">Swap the reader<small>${toAB ? 'let AlphaBet read the same material' : 'let the base model read the same material'}</small></span><b>${toAB ? '−' : '+'}${d.v.toFixed(3)}${sig(d.sig)}</b>`; }
      else { bRd.disabled = true; bRd.className = 'swap__delta'; bRd.innerHTML = `<span class="swap__dk">External reader<small>tests whether AlphaBet’s evidence helps a reader other than AlphaBet</small></span>`; }
      for (const k in cells) cells[k].classList.toggle('is-active', k === rd + '|' + ev);
    }
    render();
    return { set: (e, r) => { ev = e; rd = r; render(); } };
  }
  return { mount };
})();
