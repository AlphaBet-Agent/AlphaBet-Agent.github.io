/* Page behaviors: links, header, reveals, widget mounting, KaTeX, BibTeX copy, appendix panels. */
(function () {
  const { el, clear, reducedMotion } = ABDom;
  const D = ALPHABET_DATA;

  /* ---- project links: fill in when available; absent links render as quiet text, never dead buttons ---- */
  // Fill in the arXiv URL here when the paper is live (the header "Paper" link follows it).
  const LINKS = {
    paper: { href: '', label: 'Paper', primary: true, icon: 'paper', fallback: '#paper' },
    code: { href: 'https://github.com/AlphaBet-Agent/AlphaBet', label: 'Code', icon: 'github' },
    data: { href: 'https://huggingface.co/collections/liqinye/alphabet', label: 'Data & Models', icon: 'hf' },
    bibtex: { href: '#paper', label: 'BibTeX', icon: 'quote' },
  };
  const ICONS = {
    paper: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 1.5h5.5L13 5v9.5H4z"/><path d="M9.5 1.5V5H13M6 8h4M6 10.5h4"/></svg>',
    github: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 .2a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.49c-2.23.48-2.7-.95-2.7-.95-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 .2z"/></svg>',
    hf: '<svg viewBox="0 0 95 88" fill="none" aria-hidden="true"> <path fill="#FFD21E" d="M47.21 76.5a34.75 34.75 0 1 0 0-69.5 34.75 34.75 0 0 0 0 69.5Z" /> <path fill="#FF9D0B" d="M81.96 41.75a34.75 34.75 0 1 0-69.5 0 34.75 34.75 0 0 0 69.5 0Zm-73.5 0a38.75 38.75 0 1 1 77.5 0 38.75 38.75 0 0 1-77.5 0Z" /> <path fill="#3A3B45" d="M58.5 32.3c1.28.44 1.78 3.06 3.07 2.38a5 5 0 1 0-6.76-2.07c.61 1.15 2.55-.72 3.7-.32ZM34.95 32.3c-1.28.44-1.79 3.06-3.07 2.38a5 5 0 1 1 6.76-2.07c-.61 1.15-2.56-.72-3.7-.32Z" /> <path fill="#FF323D" d="M46.96 56.29c9.83 0 13-8.76 13-13.26 0-2.34-1.57-1.6-4.09-.36-2.33 1.15-5.46 2.74-8.9 2.74-7.19 0-13-6.88-13-2.38s3.16 13.26 13 13.26Z" /> <path fill="#3A3B45" fill-rule="evenodd" d="M39.43 54a8.7 8.7 0 0 1 5.3-4.49c.4-.12.81.57 1.24 1.28.4.68.82 1.37 1.24 1.37.45 0 .9-.68 1.33-1.35.45-.7.89-1.38 1.32-1.25a8.61 8.61 0 0 1 5 4.17c3.73-2.94 5.1-7.74 5.1-10.7 0-2.34-1.57-1.6-4.09-.36l-.14.07c-2.31 1.15-5.39 2.67-8.77 2.67s-6.45-1.52-8.77-2.67c-2.6-1.29-4.23-2.1-4.23.29 0 3.05 1.46 8.06 5.47 10.97Z" clip-rule="evenodd" /> <path fill="#FF9D0B" d="M70.71 37a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM24.21 37a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM17.52 48c-1.62 0-3.06.66-4.07 1.87a5.97 5.97 0 0 0-1.33 3.76 7.1 7.1 0 0 0-1.94-.3c-1.55 0-2.95.59-3.94 1.66a5.8 5.8 0 0 0-.8 7 5.3 5.3 0 0 0-1.79 2.82c-.24.9-.48 2.8.8 4.74a5.22 5.22 0 0 0-.37 5.02c1.02 2.32 3.57 4.14 8.52 6.1 3.07 1.22 5.89 2 5.91 2.01a44.33 44.33 0 0 0 10.93 1.6c5.86 0 10.05-1.8 12.46-5.34 3.88-5.69 3.33-10.9-1.7-15.92-2.77-2.78-4.62-6.87-5-7.77-.78-2.66-2.84-5.62-6.25-5.62a5.7 5.7 0 0 0-4.6 2.46c-1-1.26-1.98-2.25-2.86-2.82A7.4 7.4 0 0 0 17.52 48Zm0 4c.51 0 1.14.22 1.82.65 2.14 1.36 6.25 8.43 7.76 11.18.5.92 1.37 1.31 2.14 1.31 1.55 0 2.75-1.53.15-3.48-3.92-2.93-2.55-7.72-.68-8.01.08-.02.17-.02.24-.02 1.7 0 2.45 2.93 2.45 2.93s2.2 5.52 5.98 9.3c3.77 3.77 3.97 6.8 1.22 10.83-1.88 2.75-5.47 3.58-9.16 3.58-3.81 0-7.73-.9-9.92-1.46-.11-.03-13.45-3.8-11.76-7 .28-.54.75-.76 1.34-.76 2.38 0 6.7 3.54 8.57 3.54.41 0 .7-.17.83-.6.79-2.85-12.06-4.05-10.98-8.17.2-.73.71-1.02 1.44-1.02 3.14 0 10.2 5.53 11.68 5.53.11 0 .2-.03.24-.1.74-1.2.33-2.04-4.9-5.2-5.21-3.16-8.88-5.06-6.8-7.33.24-.26.58-.38 1-.38 3.17 0 10.66 6.82 10.66 6.82s2.02 2.1 3.25 2.1c.28 0 .52-.1.68-.38.86-1.46-8.06-8.22-8.56-11.01-.34-1.9.24-2.85 1.31-2.85Z" /> <path fill="#FFD21E" d="M38.6 76.69c2.75-4.04 2.55-7.07-1.22-10.84-3.78-3.77-5.98-9.3-5.98-9.3s-.82-3.2-2.69-2.9c-1.87.3-3.24 5.08.68 8.01 3.91 2.93-.78 4.92-2.29 2.17-1.5-2.75-5.62-9.82-7.76-11.18-2.13-1.35-3.63-.6-3.13 2.2.5 2.79 9.43 9.55 8.56 11-.87 1.47-3.93-1.71-3.93-1.71s-9.57-8.71-11.66-6.44c-2.08 2.27 1.59 4.17 6.8 7.33 5.23 3.16 5.64 4 4.9 5.2-.75 1.2-12.28-8.53-13.36-4.4-1.08 4.11 11.77 5.3 10.98 8.15-.8 2.85-9.06-5.38-10.74-2.18-1.7 3.21 11.65 6.98 11.76 7.01 4.3 1.12 15.25 3.49 19.08-2.12Z" /> <path fill="#FF9D0B" d="M77.4 48c1.62 0 3.07.66 4.07 1.87a5.97 5.97 0 0 1 1.33 3.76 7.1 7.1 0 0 1 1.95-.3c1.55 0 2.95.59 3.94 1.66a5.8 5.8 0 0 1 .8 7 5.3 5.3 0 0 1 1.78 2.82c.24.9.48 2.8-.8 4.74a5.22 5.22 0 0 1 .37 5.02c-1.02 2.32-3.57 4.14-8.51 6.1-3.08 1.22-5.9 2-5.92 2.01a44.33 44.33 0 0 1-10.93 1.6c-5.86 0-10.05-1.8-12.46-5.34-3.88-5.69-3.33-10.9 1.7-15.92 2.78-2.78 4.63-6.87 5.01-7.77.78-2.66 2.83-5.62 6.24-5.62a5.7 5.7 0 0 1 4.6 2.46c1-1.26 1.98-2.25 2.87-2.82A7.4 7.4 0 0 1 77.4 48Zm0 4c-.51 0-1.13.22-1.82.65-2.13 1.36-6.25 8.43-7.76 11.18a2.43 2.43 0 0 1-2.14 1.31c-1.54 0-2.75-1.53-.14-3.48 3.91-2.93 2.54-7.72.67-8.01a1.54 1.54 0 0 0-.24-.02c-1.7 0-2.45 2.93-2.45 2.93s-2.2 5.52-5.97 9.3c-3.78 3.77-3.98 6.8-1.22 10.83 1.87 2.75 5.47 3.58 9.15 3.58 3.82 0 7.73-.9 9.93-1.46.1-.03 13.45-3.8 11.76-7-.29-.54-.75-.76-1.34-.76-2.38 0-6.71 3.54-8.57 3.54-.42 0-.71-.17-.83-.6-.8-2.85 12.05-4.05 10.97-8.17-.19-.73-.7-1.02-1.44-1.02-3.14 0-10.2 5.53-11.68 5.53-.1 0-.19-.03-.23-.1-.74-1.2-.34-2.04 4.88-5.2 5.23-3.16 8.9-5.06 6.8-7.33-.23-.26-.57-.38-.98-.38-3.18 0-10.67 6.82-10.67 6.82s-2.02 2.1-3.24 2.1a.74.74 0 0 1-.68-.38c-.87-1.46 8.05-8.22 8.55-11.01.34-1.9-.24-2.85-1.31-2.85Z" /> <path fill="#FFD21E" d="M56.33 76.69c-2.75-4.04-2.56-7.07 1.22-10.84 3.77-3.77 5.97-9.3 5.97-9.3s.82-3.2 2.7-2.9c1.86.3 3.23 5.08-.68 8.01-3.92 2.93.78 4.92 2.28 2.17 1.51-2.75 5.63-9.82 7.76-11.18 2.13-1.35 3.64-.6 3.13 2.2-.5 2.79-9.42 9.55-8.55 11 .86 1.47 3.92-1.71 3.92-1.71s9.58-8.71 11.66-6.44c2.08 2.27-1.58 4.17-6.8 7.33-5.23 3.16-5.63 4-4.9 5.2.75 1.2 12.28-8.53 13.36-4.4 1.08 4.11-11.76 5.3-10.97 8.15.8 2.85 9.05-5.38 10.74-2.18 1.69 3.21-11.65 6.98-11.76 7.01-4.31 1.12-15.26 3.49-19.08-2.12Z" /> </svg>',
    quote: '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3 3h4.5v4.5c0 2.2-1.3 3.9-3.6 4.6l-.5-1.1c1.3-.5 2-1.3 2.2-2.4H3zM9 3h4.5v4.5c0 2.2-1.3 3.9-3.6 4.6l-.5-1.1c1.3-.5 2-1.3 2.2-2.4H9z"/></svg>',
  };
  function renderLinks(target, opts) {
    clear(target);
    Object.entries(LINKS).forEach(([k, L]) => {
      if (opts && opts.skip && opts.skip.includes(k)) return;
      const href = L.href || L.fallback; if (!href) return;
      const ext = href.startsWith('http');
      const a = el('a', { class: 'btn btn--primary', href, html: ICONS[L.icon] + '<span>' + L.label + '</span>' }, target);
      if (ext) { a.target = '_blank'; a.rel = 'noopener'; }
    });
  }
  document.querySelectorAll('#links').forEach(n => renderLinks(n));
  document.querySelectorAll('#links-2').forEach(n => renderLinks(n, { skip: ['bibtex'] }));
  document.querySelectorAll('.main-nav a[data-link="paper"]').forEach(a => { if (LINKS.paper.href) { a.href = LINKS.paper.href; a.target = '_blank'; a.rel = 'noopener'; a.classList.add('ext'); } });

  /* ---- header hairline on scroll + active nav ---- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  const navLinks = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id)); } });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* ---- dateline month ticks ---- */
  const dl = document.querySelector('.dateline .dl-ticks');
  if (dl) { for (let i = 0; i <= 10; i++) { const x = 14 + (666 - 14) * i / 10; const t = document.createElementNS('http://www.w3.org/2000/svg', 'line'); t.setAttribute('x1', x); t.setAttribute('x2', x); t.setAttribute('y1', 21); t.setAttribute('y2', 29); dl.appendChild(t); } }

  /* ---- widgets ---- */
  const mountIf = (id, fn) => { const n = document.getElementById(id); if (n) try { fn(n); } catch (e) { console.error(id, e); } };
  mountIf('episode', n => ABEpisode.mount(n));
  mountIf('compass', n => ABCompass.mount(n));
  mountIf('curves', n => ABCurves.mount(n));
  mountIf('swap-widget', n => ABSwap.mount(n));
  mountIf('horizon-chart', n => ABHorizon.mount(n));
  mountIf('gdiag', n => ABGrpoDiag.mount(n));
  mountIf('results-table', n => ABTable.mount(n));
  // scrollable chart containers: drop the right-edge fade once scrolled to the end (or when nothing overflows)
  document.querySelectorAll('.horizon, .curves, .gdiag').forEach(sc => { const f = () => sc.classList.toggle('is-end', sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 2); sc.addEventListener('scroll', f, { passive: true }); window.addEventListener('resize', f, { passive: true }); f(); });

  /* ---- appendix panels built from data ---- */
  mountIf('data-panel', n => {
    const s = D.splits;
    n.innerHTML = `<table class="kv"><tbody>
      <tr><th>Events (train / val / test)</th><td>${s.train.events.toLocaleString()} / ${s.val.events} / ${s.test.events}</td></tr>
      <tr><th>Question-dates</th><td>${s.train.steps.toLocaleString()} / ${s.val.steps} / ${s.test.steps}</td></tr>
      <tr><th>Binary · multi-option events</th><td>${s.train.binary} · ${s.train.multi} (train); ${s.test.binary} · ${s.test.multi} (test)</td></tr>
      <tr><th>Forecast dates per event</th><td>${s.train.meanSteps} on average, ${s.train.stepsRange[0]}–${s.train.stepsRange[1]} (train); ${s.test.meanSteps}, ${s.test.stepsRange[0]}–${s.test.stepsRange[1]} (test)</td></tr>
      <tr><th>Median horizon</th><td>${s.train.medianHorizonDays} days (train) · ${s.val.medianHorizonDays} (val) · ${s.test.medianHorizonDays} (test)</td></tr>
      <tr><th>FutureX pool</th><td>${D.futurex.items} L1–L2 items: ${D.futurex.yesno} yes/no, ${D.futurex.mc} multiple-choice, ${D.futurex.freeform} free-form</td></tr>
    </tbody></table>`;
    el('div', { class: 'subhead', text: 'Primary domain · share of training events' }, n);
    const bars = el('div', { class: 'bars' }, n);
    const tot = D.domains.reduce((a, d) => a + d.train, 0);
    D.domains.forEach(d => {
      const pct = d.train / tot * 100;
      el('div', { class: 'bars__row', html: `<span>${d.name}</span><span class="bars__track"><span class="bars__fill" style="width:${pct.toFixed(1)}%"></span></span><span class="bars__v">${pct.toFixed(1)}%</span>` }, bars);
    });
    el('div', { class: 'subhead', text: 'Forecast horizon · share of question-dates (train in light gray, test in dark gray)' }, n);
    const hb = el('div', { class: 'bars' }, n);
    const tTot = D.horizonDist.reduce((a, d) => a + d.train, 0), eTot = D.horizonDist.reduce((a, d) => a + d.test, 0);
    D.horizonDist.forEach(d => {
      el('div', { class: 'bars__row', html: `<span>${d.label} days</span><span class="bars__track"><span class="bars__fill" style="width:${(d.train / tTot * 100).toFixed(1)}%"></span></span><span class="bars__v">${(d.train / tTot * 100).toFixed(1)}%</span>` }, hb);
      el('div', { class: 'bars__row', html: `<span></span><span class="bars__track"><span class="bars__fill bars__fill--blue" style="width:${(d.test / eTot * 100).toFixed(1)}%"></span></span><span class="bars__v">${(d.test / eTot * 100).toFixed(1)}%</span>` }, hb);
    });
  });
  mountIf('setup-panel', n => {
    const t = D.training;
    n.innerHTML = `<table class="kv"><tbody>
      <tr><th>Policy</th><td>${t.policy}; checkpoint released ${t.checkpointRelease}</td></tr>
      <tr><th>Reward</th><td>${t.reward}</td></tr>
      <tr><th>Advantage</th><td>${t.advantage}</td></tr>
      <tr><th>Rollouts per input</th><td>G = ${t.G}, temperature 1.0; tool budget ${t.toolBudget}</td></tr>
      <tr><th>Optimizer</th><td>Adam, learning rate ${t.lr}, clip ${t.clip[0].toFixed(2)} / ${t.clip[1].toFixed(2)}, no KL or entropy regularization, weight decay 0.1</td></tr>
      <tr><th>Corpus and retrieval</th><td>${t.corpus}; ${t.articles}; ${t.retriever}; retrieval restricted to articles dated no later than the forecast date</td></tr>
      <tr><th>Compute</th><td>${t.gpus}; slime + Megatron-LM for optimization, SGLang for rollouts, Ray for orchestration</td></tr>
      <tr><th>Wall clock</th><td>${t.wallClock}; memory-on ${t.memoryOnCost}</td></tr>
    </tbody></table>`;
  });

  /* ---- KaTeX ---- */
  function renderMath() {
    if (!window.katex) return;
    document.querySelectorAll('.math[data-tex]').forEach(n => {
      try { katex.render(n.dataset.tex, n, { displayMode: !n.classList.contains('math--inline'), throwOnError: false }); } catch (e) { /* keep plain text */ }
    });
  }
  if (window.katex) renderMath(); else { const k = document.querySelector('script[src*="katex"]'); if (k) k.addEventListener('load', renderMath); }

  /* ---- BibTeX copy ---- */
  const copy = document.getElementById('copy-bib');
  if (copy) {
    const COPY = copy.innerHTML, CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'; let t;
    copy.addEventListener('click', async () => {
      const pre = document.getElementById('bibtex'); let ok = true;
      try { await navigator.clipboard.writeText(pre.textContent); } catch (e) {
        ok = false; const r = document.createRange(); r.selectNodeContents(pre); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      }
      copy.innerHTML = ok ? CHECK : COPY; copy.classList.toggle('is-done', ok);
      copy.setAttribute('aria-label', ok ? 'Copied' : 'Selected — press Cmd or Ctrl + C to copy'); copy.setAttribute('title', ok ? 'Copied' : 'Press ⌘/Ctrl+C');
      clearTimeout(t); t = setTimeout(() => { copy.innerHTML = COPY; copy.classList.remove('is-done'); copy.setAttribute('aria-label', 'Copy BibTeX'); copy.setAttribute('title', 'Copy BibTeX'); }, 1800);
    });
  }
})();
