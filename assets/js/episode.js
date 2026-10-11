/* Block 02 — longitudinal forecasting as one training episode. A real Polymarket question and its real outcome; the
   forecast dates and the probability bars are ILLUSTRATIVE placeholders (replace EPISODE.steps with the agent's real
   schedule and reports to show a real trajectory). Layout, top to bottom: the question card; the environment band (a
   dated news corpus whose ticks are aligned with the time axis, plus a code sandbox); the agent on the time axis with
   its per-date loop — reason · search · read · compute in any order and any number of times, then forecast — the
   committed forecasts under each date; the outcome card at the resolution date; the scoring line; and the training
   rail (red): every dated score is a reward (−Brier plus a format term), centered within its own date's group of
   rollouts (mean-centered GRPO). The episode plays on its own while in view and loops; dragging the slider or clicking
   a stop pauses it, the round button resumes it. */
window.ABEpisode = (function () {
  const { el, svg, clear, reducedMotion, tween } = ABDom;
  const M = ABMath;
  const EPISODE = {
    question: 'What will the Fed decide in September 2025?',
    outcomes: ['Hold', '25 bp cut', '50+ bp cut'],
    short: ['hold', '25', '50+'],
    resolvesShort: 'Sep 17',
    realized: 1,
    // loop: the order in which the agent uses its actions on that date (0 reason · 1 search · 2 read · 3 compute);
    // the agent chooses — the sequences differ in length and order on purpose. Forecast always comes last.
    steps: [
      { date: 'Aug 27', tau: 'τ₁', out: '21 days before', p: [0.20, 0.70, 0.10], loop: [0, 1, 2, 0, 3] },
      { date: 'Sep 3',  tau: 'τ₂', out: '14 days before', p: [0.15, 0.75, 0.10], loop: [0, 1, 2, 1, 2, 0] },
      { date: 'Sep 10', tau: 'τ₃', out: '7 days before',  p: [0.08, 0.72, 0.20], loop: [0, 1, 2, 3, 0, 3] },
      { date: 'Sep 15', tau: 'τ₄', out: '2 days before',  p: [0.05, 0.85, 0.10], loop: [0, 1, 2, 0] },
    ],
  };
  const ACTIONS = [{ k: 'reason', w: 60 }, { k: 'search', w: 60 }, { k: 'read', w: 48 }, { k: 'compute', w: 68 }];
  const FORECAST = { k: 'forecast', w: 70 };
  const A_SEARCH = 1, A_READ = 2, A_COMPUTE = 3, P_FORECAST = 4;
  const PHASE_MS = 340, SLIDE_MS = 480, DATE_HOLD = 420, RESOLVE_HOLD = 1600, TRAIN_HOLD = 3200;
  // line icons (24-unit boxes)
  const ICONS = {
    news: ['M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2', 'M18 14h-8', 'M15 18h-5', 'M10 6h8v4h-8V6Z'],
    terminal: ['M4 17l6-6-6-6', 'M12 19h8'],
    loop: ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
    flame: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'],
  };
  function icon(parent, name, x, y, size, cls) {
    const g = svg('svg', { viewBox: '0 0 24 24', x, y, width: size, height: size, class: 'ep__icon ' + (cls || ''), fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, parent);
    ICONS[name].forEach(d => svg('path', { d }, g)); return g;
  }
  const PLAY_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" fill="currentColor"/></svg>';
  const PAUSE_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>';
  // deterministic pseudo-random article cards (two staggered rows along the time axis) so the strip looks the same on every load
  function docs(n, x0, x1) {
    // two staggered rows of small article cards, lightly jittered so the strip reads as an archive rather than a grid
    const out = []; let seed = 11; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let i = 0; i < n; i++) { const t = (i + 0.25 + rnd() * 0.5) / n; out.push({ x: x0 + (x1 - x0) * t, row: (i % 2) ^ (rnd() < 0.22 ? 1 : 0) }); }
    return out;
  }

  function mount(container) {
    clear(container); container.classList.add('ep');
    const E = EPISODE, Y = E.realized, STEPS = E.steps, K = E.outcomes.length, N = STEPS.length;
    const STOP_RES = N, STOP_TRAIN = N + 1;
    const W = 1200, H = 538, X0 = 0, X1 = 1176;
    const dateX = STEPS.map((_, i) => 165 + i * 231), resX = 1040, tlY = 316;   // 165 · 396 · 627 · 858
    const scroller = el('div', { class: 'ep__scroller' }, container);
    const s = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'ep__svg', role: 'img', 'aria-label': 'One longitudinal forecasting episode on a real question: on each forecast date the agent reasons, searches and reads news published by that date and runs code, in whatever order and as often as it chooses within its tool budget, then commits a forecast; the resolved outcome scores every dated forecast and each score is a training reward. Dates and probabilities are illustrative.' }, scroller);
    const defs = svg('defs', null, s);
    const head = (id, cls) => { const mk = svg('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }, defs); svg('path', { d: 'M 0 0 L 10 5 L 0 10 z', class: cls }, mk); };
    head('ep-connhead', 'ep__connhead'); head('ep-connhead-hot', 'ep__connhead--hot'); head('ep-trainhead', 'ep__trainhead');

    /* ---- question card ---- */
    const qY = 0, qH = 68;
    svg('rect', { x: X0, y: qY, width: X1 - X0, height: qH, rx: 12, class: 'ep__qbox' }, s);
    svg('text', { x: X0 + 22, y: qY + 42, class: 'ep__q', text: E.question }, s);
    const chipW = E.outcomes.map(o => Math.round(o.length * 7.8 + 28));
    let cx = X1 - 18 - chipW.reduce((a, b) => a + b, 0) - 8 * (K - 1);
    svg('text', { x: cx - 16, y: qY + 39, class: 'ep__qmeta', 'text-anchor': 'end', text: 'outcomes' }, s);
    E.outcomes.forEach((o, k) => { svg('rect', { x: cx, y: qY + 20, width: chipW[k], height: 28, rx: 14, class: 'ep__chip' }, s); svg('text', { x: cx + chipW[k] / 2, y: qY + 39, class: 'ep__chiplbl', 'text-anchor': 'middle', text: o }, s); cx += chipW[k] + 8; });

    /* ---- environment band: dated corpus (aligned with the time axis) + sandbox ---- */
    const bandY = 84, bandH = 92, bandBot = bandY + bandH, corpX1 = 920, sbX0 = 948, sbMid = (sbX0 + X1) / 2;
    const corpBox = svg('rect', { x: X0, y: bandY, width: corpX1 - X0, height: bandH, rx: 12, class: 'ep__box' }, s);
    icon(s, 'news', X0 + 18, bandY + 13, 18, 'ep__icon--box');
    svg('text', { x: X0 + 44, y: bandY + 28, class: 'ep__boxlbl', text: 'Information corpus' }, s);
    const lockLbl = svg('text', { x: corpX1 - 18, y: bandY + 28, class: 'ep__boxsub', 'text-anchor': 'end', text: 'later articles locked' }, s);
    const stripY = bandY + 70, rowDy = 7, gw = 7, gh = 9, stripX0 = X0 + 22;
    const hl = svg('rect', { x: stripX0 - 6, y: stripY - 17, width: 0, height: 34, rx: 6, class: 'ep__corpushl' }, s);   // what the agent may read
    const DOCS = docs(92, stripX0, corpX1 - 22);
    const docEls = DOCS.map(d => svg('rect', { x: d.x - gw / 2, y: stripY + (d.row ? rowDy : -rowDy) - gh / 2, width: gw, height: gh, rx: 1.4, class: 'ep__doc ep__doc--future' }, s));
    const bnd = svg('g', { class: 'ep__bnd' }, s);
    svg('line', { x1: 0, x2: 0, y1: bandY + 54, y2: stripY + 20, class: 'ep__boundary' }, bnd);
    const bndPill = svg('rect', { x: 4, y: bandY + 34, width: 120, height: 20, rx: 10, class: 'ep__bndpill' }, bnd);
    const bndLbl = svg('text', { x: 12, y: bandY + 48, class: 'ep__bndlbl' }, bnd);
    let hlW = 0;
    const sbBox = svg('rect', { x: sbX0, y: bandY, width: X1 - sbX0, height: bandH, rx: 12, class: 'ep__box' }, s);
    icon(s, 'terminal', sbX0 + 18, bandY + 13, 18, 'ep__icon--box');
    svg('text', { x: sbX0 + 44, y: bandY + 28, class: 'ep__boxlbl', text: 'Sandbox' }, s);
    svg('text', { x: sbX0 + 18, y: bandY + 54, class: 'ep__code', text: 'python(code)' }, s);
    svg('text', { x: sbX0 + 18, y: bandY + 76, class: 'ep__boxsub', text: 'base rates · simulation' }, s);

    /* ---- the agent's loop: a pill of four actions the agent cycles through as it likes, then the forecast exit ---- */
    const chipsY = 226, chipsH = 24, pillPad = 10, glyph = 24, pillTop = chipsY - 8;
    const actW = ACTIONS.reduce((a, p) => a + p.w, 0) + 6 * (ACTIONS.length - 1);
    const pillW = pillPad + glyph + 6 + actW + pillPad, pillX = -pillW / 2;              // centred on the agent
    const connG = svg('g', { class: 'ep__connG' }, s);
    const conn = svg('line', { class: 'ep__conn', 'marker-start': 'url(#ep-connhead)', 'marker-end': 'url(#ep-connhead)', x1: 0, x2: 0, y1: bandBot + 7, y2: pillTop - 7 }, connG);
    const elbow = svg('path', { class: 'ep__conn ep__conn--elbow', 'marker-end': 'url(#ep-connhead)' }, s);
    const chips = svg('g', { class: 'ep__chips' }, s);
    svg('rect', { x: pillX, y: pillTop, width: pillW, height: chipsH + 16, rx: 20, class: 'ep__pill' }, chips);
    icon(chips, 'loop', pillX + pillPad, chipsY + chipsH / 2 - glyph / 2 + 2, glyph - 4, 'ep__icon--loop');
    let px = pillX + pillPad + glyph + 6, computeCx = 0;
    const chip = (p, k) => { const g = svg('g', { class: 'ep__act' }, chips);
      svg('rect', { x: px, y: chipsY, width: p.w, height: chipsH, rx: 12, class: 'ep__actbox' }, g);
      svg('text', { x: px + p.w / 2, y: chipsY + 16, class: 'ep__actlbl', 'text-anchor': 'middle', text: p.k }, g);
      if (k === A_COMPUTE) computeCx = px + p.w / 2;
      px += p.w + 6; return g; };
    const chipEls = ACTIONS.map(chip);
    const exitX0 = pillX + pillW, exitLen = 26; px = exitX0 + exitLen + 4;
    svg('line', { x1: exitX0 + 2, x2: exitX0 + exitLen - 2, y1: chipsY + chipsH / 2, y2: chipsY + chipsH / 2, class: 'ep__exit', 'marker-end': 'url(#ep-connhead)' }, chips);
    chipEls.push(chip(FORECAST, P_FORECAST));

    /* ---- time axis ---- */
    svg('line', { x1: X0, x2: X1 - 8, y1: tlY, y2: tlY, class: 'ep__axis' }, s);
    svg('path', { d: `M ${X1 - 8} ${tlY - 4} L ${X1} ${tlY} L ${X1 - 8} ${tlY + 4} Z`, class: 'ep__axishead' }, s);
    svg('path', { d: `M ${resX} ${tlY - 7} L ${resX + 7} ${tlY} L ${resX} ${tlY + 7} L ${resX - 7} ${tlY} Z`, class: 'ep__resnode' }, s);
    svg('text', { x: resX, y: tlY + 24, class: 'ep__date ep__date--res', 'text-anchor': 'middle', text: `resolves ${E.resolvesShort}` }, s);

    /* ---- forecasts under each date ---- */
    const barW = 18, gap = 12, groupW = K * barW + (K - 1) * gap, maxH = 64, baseY = tlY + 114;
    const groups = STEPS.map((st, i) => {
      const gx = dateX[i] - groupW / 2;
      const g = svg('g', { class: 'ep__step' }, s);
      svg('circle', { cx: dateX[i], cy: tlY, r: 6, class: 'ep__node' }, g);
      svg('text', { x: dateX[i], y: tlY + 24, class: 'ep__date', 'text-anchor': 'middle', text: `${st.date} · ${st.out}` }, g);
      svg('line', { x1: gx - 8, x2: gx + groupW + 8, y1: baseY, y2: baseY, class: 'ep__baseline' }, g);
      const bars = E.outcomes.map((o, k) => { const bx = gx + k * (barW + gap);
        const b = svg('rect', { x: bx, width: barW, y: baseY, height: 0, rx: 2, class: `ep__bar${k === Y ? ' ep__bar--realized' : ''}` }, g);
        const t = svg('text', { x: bx + barW / 2, y: baseY - 5, class: 'ep__p num', 'text-anchor': 'middle' }, g);
        svg('text', { x: bx + barW / 2, y: baseY + 15, class: 'ep__o', 'text-anchor': 'middle', text: E.short[k] }, g);
        return { b, t, h: 0, gen: 0 }; });
      return { g, bars };
    });

    /* ---- the agent (moves along the axis) ---- */
    const aY = tlY - 50;   // top of the antenna
    const agent = svg('g', { class: 'ep__agent' }, s);
    svg('rect', { x: -18, y: aY + 12, width: 36, height: 32, rx: 8, class: 'ep__agentbody' }, agent);
    svg('rect', { x: -2, y: aY + 2, width: 4, height: 10, rx: 2, class: 'ep__agentbody' }, agent);
    svg('circle', { cx: 0, cy: aY, r: 3, class: 'ep__agentbody' }, agent);
    svg('circle', { cx: -7, cy: aY + 26, r: 3, class: 'ep__agenteye' }, agent); svg('circle', { cx: 7, cy: aY + 26, r: 3, class: 'ep__agenteye' }, agent);
    svg('text', { x: 36, y: aY + 33, class: 'ep__agentlbl', text: 'LLM agent' }, agent);

    /* ---- outcome card ---- */
    const cardX = resX - 65, cardY = tlY + 38, cardW = 130, cardH = 90;
    const card = svg('g', { class: 'ep__card' }, s);
    svg('rect', { x: cardX, y: cardY, width: cardW, height: cardH, rx: 10, class: 'ep__cardbox' }, card);
    svg('text', { x: resX, y: cardY + 19, class: 'ep__cardlbl', 'text-anchor': 'middle', text: 'outcome' }, card);
    svg('text', { x: resX, y: cardY + 61, class: 'ep__cardq', 'text-anchor': 'middle', text: '?' }, card);
    svg('text', { x: resX, y: cardY + 55, class: 'ep__cardval', 'text-anchor': 'middle', text: E.outcomes[Y] }, card);
    const cardState = svg('text', { x: resX, y: cardY + 79, class: 'ep__cardstate', 'text-anchor': 'middle', text: 'hidden' }, card);

    /* ---- scoring line (in segments so it never runs through a stamp) + Brier stamps ---- */
    const scoreY = baseY + 28, half = 50;
    const score = svg('g', { class: 'ep__score' }, s);
    let dl = `M ${resX} ${cardY + cardH} V ${scoreY} H ${dateX[N - 1] + half}`;
    for (let i = N - 1; i > 0; i--) dl += ` M ${dateX[i] - half} ${scoreY} H ${dateX[i - 1] + half}`;
    svg('path', { d: dl, class: 'ep__scoreline' }, score);
    STEPS.forEach((st, i) => svg('text', { x: dateX[i], y: scoreY + 4, class: 'ep__stamp num', 'text-anchor': 'middle', text: `Brier ${M.brier(st.p, Y).toFixed(3)}` }, score));

    /* ---- training (red): the four scores collect into one rail, and the updated policy loops back to the agent ---- */
    const busY = scoreY + 18, railY = scoreY + 36, railH = 40, railW = 560, midX = (dateX[0] + dateX[N - 1]) / 2, railX = midX - railW / 2;
    const train = svg('g', { class: 'ep__train' }, s);
    const feeds = svg('g', { class: 'ep__feeds' }, train);
    STEPS.forEach((_, i) => svg('line', { x1: dateX[i], x2: dateX[i], y1: scoreY + 10, y2: busY, class: 'ep__feed' }, feeds));
    svg('line', { x1: dateX[0], x2: dateX[N - 1], y1: busY, y2: busY, class: 'ep__feed' }, feeds);
    svg('line', { x1: midX, x2: midX, y1: busY, y2: railY - 3, class: 'ep__feed', 'marker-end': 'url(#ep-trainhead)' }, feeds);
    svg('rect', { x: railX, y: railY, width: railW, height: railH, rx: 8, class: 'ep__railbox' }, train);
    const railLbl = svg('g', { class: 'ep__raillblg' }, train);
    icon(railLbl, 'flame', railX + 18, railY + 12, 16, 'ep__icon--flame');
    svg('text', { x: railX + 40, y: railY + 25, class: 'ep__raillbl', text: 'training' }, railLbl);
    svg('text', { x: railX + 126, y: railY + 25, class: 'ep__railtext', text: 'reward = −Brier + format term   ·   mean-centered GRPO per question-date' }, train);
    const loop = svg('g', { class: 'ep__loop' }, train);
    const loopX = X1 + 16, loopTop = aY + 12, agentRight = dateX[N - 1] + 18 + 6;
    svg('path', { d: `M ${railX + railW} ${railY + railH / 2} H ${loopX} V ${loopTop} H ${agentRight}`, class: 'ep__loopline', 'marker-end': 'url(#ep-trainhead)' }, loop);
    svg('text', { x: (loopX + agentRight) / 2 + 20, y: loopTop + 16, class: 'ep__looplbl', 'text-anchor': 'middle', text: 'updated policy' }, loop);

    /* ---- controls: a scrubber with the six stops and a round pause/play button ---- */
    const ctl = el('div', { class: 'ep__ctl' }, container);
    const scrub = el('div', { class: 'ep__scrub' }, ctl);
    const range = el('input', { type: 'range', min: 0, max: STOP_TRAIN, step: 1, value: 0, class: 'ep__range', 'aria-label': 'Episode position: four forecast dates, resolution, training' }, scrub);
    const stops = el('div', { class: 'ep__stops' }, scrub);
    const stopDefs = [...STEPS.map(st => [`${st.tau} · ${st.date}`, st.date, '']), [`Resolves · ${E.resolvesShort}`, 'Resolves', ' ep__stop--res'], ['Train', 'Train', ' ep__stop--train']];
    const nStops = stopDefs.length;
    const stopEls = stopDefs.map(([lbl, short, cls], i) => {
      // each label sits under the thumb position for its value (native thumb ≈ 16px wide); the first and last hug the edges
      const pos = i === 0 ? { left: '0', transform: 'none' } : i === nStops - 1 ? { left: '100%', transform: 'translateX(-100%)' } : { left: `calc(8px + (100% - 16px) * ${i / (nStops - 1)})`, transform: 'translateX(-50%)' };
      const b = el('button', { type: 'button', class: 'ep__stop' + cls, style: pos, html: `<span class="ep__stop-long">${lbl}</span><span class="ep__stop-short">${short}</span>`, 'aria-pressed': 'false' }, stops);
      b.addEventListener('click', () => { pause(true); render(i, -1); }); return b; });
    range.addEventListener('input', () => { pause(true); render(+range.value, -1); });
    const play = el('button', { type: 'button', class: 'ep__play', 'aria-label': 'Pause the episode', html: PAUSE_SVG }, ctl);
    play.addEventListener('click', () => { if (running) pause(true); else resume(); });
    scroller.addEventListener('scroll', () => { scroller.classList.toggle('is-end', scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 2); }, { passive: true });

    /* ---- state ---- */
    let step = 0, mounted = false;
    const setBars = (j, on, animate) => groups[j].bars.forEach((b, k) => { const h = on ? STEPS[j].p[k] * maxH : 0, from = b.h, gen = ++b.gen; b.h = h;
      const draw = v => { if (b.gen !== gen) return; b.b.setAttribute('y', baseY - v); b.b.setAttribute('height', v); b.t.setAttribute('y', baseY - v - 5); };
      if (animate) tween(from, h, 420, draw); else draw(h);
      b.t.textContent = on ? String(Math.round(STEPS[j].p[k] * 100)) : ''; });

    // i: stop index; ph: -1 settled state of that stop · -2 just arrived (nothing lit yet) · 0..3 action in progress · 4 forecast
    // visited: actions already used on this date (play mode), so the loop shows where the agent has been
    function render(i, ph, visited) {
      step = i; visited = visited || [];
      const cur = Math.min(i, N - 1), resolved = i >= STOP_RES, training = i >= STOP_TRAIN, x = dateX[cur];
      container.classList.toggle('is-resolved', resolved); container.classList.toggle('is-training', training);
      range.value = i; range.setAttribute('aria-valuetext', training ? 'Training update' : resolved ? 'Resolved' : `${STEPS[cur].tau}, ${STEPS[cur].date}`);
      stopEls.forEach((d, k) => d.setAttribute('aria-pressed', String(k === i)));
      // corpus: cards published by the current date are readable (filled); later ones are outlines; a few readable ones
      // light up blue once the agent has searched — the evidence it retrieved on this date
      const hits = new Set(); if (!resolved && ph !== 0 && ph !== -2) { let sd = 97 + cur * 13; const r = () => { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; };
        const pool = DOCS.map((d, k) => k).filter(k => DOCS[k].x <= x - 4); const nh = Math.min(4, Math.ceil(pool.length / 2)); for (let q = 0; q < nh && pool.length; q++) hits.add(pool.splice(Math.floor(r() * pool.length), 1)[0]); }
      DOCS.forEach((d, k) => { const acc = d.x <= x; docEls[k].classList.toggle('ep__doc--future', !acc); docEls[k].classList.toggle('ep__doc--acc', acc); docEls[k].classList.toggle('is-hit', hits.has(k)); });
      const hw = Math.max(0, x - (stripX0 - 6) + 2); tween(hlW, hw, 480, v => hl.setAttribute('width', v)); hlW = hw;
      bnd.style.transform = `translateX(${x}px)`;
      const left = cur >= N - 2; bndLbl.textContent = `published by ${STEPS[cur].date}`;
      const tw = bndLbl.getComputedTextLength ? bndLbl.getComputedTextLength() : 110;
      bndLbl.setAttribute('text-anchor', left ? 'end' : 'start'); bndLbl.setAttribute('x', left ? -12 : 12);
      bndPill.setAttribute('width', tw + 16); bndPill.setAttribute('x', left ? -4 - (tw + 16) : 4);
      lockLbl.style.opacity = cur >= N - 1 ? 0 : 1;
      agent.style.transform = `translateX(${x}px)`; chips.style.transform = `translateX(${x}px)`; connG.style.transform = `translateX(${x}px)`;
      agent.classList.toggle('is-idle', resolved); chips.classList.toggle('is-idle', resolved);
      connG.style.opacity = resolved ? 0 : 1;
      elbow.setAttribute('d', `M ${x + computeCx} ${pillTop - 7} V ${bandBot + 18} H ${sbMid} V ${bandBot + 7}`);
      const searching = ph === A_SEARCH || ph === A_READ, computing = ph === A_COMPUTE;
      conn.classList.toggle('is-hot', searching); corpBox.classList.toggle('is-hot', searching);
      elbow.classList.toggle('is-hot', computing); sbBox.classList.toggle('is-hot', computing);
      conn.setAttribute('marker-start', searching ? 'url(#ep-connhead-hot)' : 'url(#ep-connhead)'); conn.setAttribute('marker-end', searching ? 'url(#ep-connhead-hot)' : 'url(#ep-connhead)');
      elbow.setAttribute('marker-end', computing ? 'url(#ep-connhead-hot)' : 'url(#ep-connhead)');
      chipEls.forEach((c, k) => { c.classList.toggle('is-on', k === ph); c.classList.toggle('is-done', ph === -1 || (k !== ph && visited.includes(k))); });
      groups.forEach((g, j) => { const on = j < cur || (j === cur && (ph === -1 || ph === P_FORECAST));
        g.g.classList.toggle('is-on', on); g.g.classList.toggle('is-cur', j === cur && !resolved);
        if (on !== (g.bars[0].h > 0)) setBars(j, on, j === cur && ph === P_FORECAST); });
      cardState.textContent = resolved ? 'revealed' : 'hidden';
      if (mounted && scroller.scrollWidth > scroller.clientWidth + 4) { const k = scroller.scrollWidth / W; const target = resolved ? resX : x; scroller.scrollTo({ left: Math.max(0, target * k - scroller.clientWidth / 2), behavior: reducedMotion() ? 'auto' : 'smooth' }); }
    }

    /* ---- the self-running loop: a list of frames, played while the figure is in view ---- */
    const frames = [], firstFrameOf = [];
    STEPS.forEach((st, i) => {
      firstFrameOf[i] = frames.length;
      frames.push({ ms: SLIDE_MS, fn: () => render(i, -2) });
      const seen = [];
      [...st.loop, P_FORECAST].forEach((a, j, seq) => { const v = seen.slice(); frames.push({ ms: PHASE_MS + (j === seq.length - 1 ? DATE_HOLD : 0), fn: () => render(i, a, v) }); seen.push(a); });
    });
    firstFrameOf[STOP_RES] = frames.length; frames.push({ ms: RESOLVE_HOLD, fn: () => render(STOP_RES, -1) });
    firstFrameOf[STOP_TRAIN] = frames.length; frames.push({ ms: TRAIN_HOLD, fn: () => render(STOP_TRAIN, -1) });
    let idx = 0, timer = null, running = false, userPaused = false, inView = false;
    function tick() { const f = frames[idx]; f.fn(); timer = setTimeout(() => { idx = (idx + 1) % frames.length; tick(); }, f.ms); }
    function start() { if (running) return; running = true; play.innerHTML = PAUSE_SVG; play.setAttribute('aria-label', 'Pause the episode'); container.classList.add('is-playing'); tick(); }
    function pause(byUser) { if (byUser) userPaused = true; if (!running) return; running = false; clearTimeout(timer); timer = null; play.innerHTML = PLAY_SVG; play.setAttribute('aria-label', 'Play the episode'); container.classList.remove('is-playing'); }
    function resume() { userPaused = false; idx = firstFrameOf[step] !== undefined ? firstFrameOf[step] : 0; if (step >= STOP_TRAIN) idx = 0; start(); }
    const autoplay = !reducedMotion();
    render(autoplay ? 0 : STOP_TRAIN, -1); mounted = true;
    if (!autoplay) { play.innerHTML = PLAY_SVG; play.setAttribute('aria-label', 'Play the episode'); }
    else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { inView = e.isIntersecting; if (inView && !userPaused) start(); else if (!inView) pause(false); }), { threshold: 0.35 });
      io.observe(container);
    } else start();
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(false); else if (inView && !userPaused) start(); });
    return { render, play: resume, pause: () => pause(true) };
  }
  return { mount };
})();
