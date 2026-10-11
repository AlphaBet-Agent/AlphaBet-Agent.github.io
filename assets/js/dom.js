/* Tiny DOM/SVG helpers. */
window.ABDom = (function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function attrs(node, a) {
    if (!a) return node;
    for (const k in a) {
      const v = a[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
    return node;
  }
  function svg(tag, a, parent) { const n = attrs(document.createElementNS(SVG_NS, tag), a); if (parent) parent.appendChild(n); return n; }
  function el(tag, a, parent) { const n = attrs(document.createElement(tag), a); if (parent) parent.appendChild(n); return n; }
  function clear(node) { const keep = [...node.querySelectorAll(':scope > .fig-tag')]; while (node.firstChild) node.removeChild(node.firstChild); keep.forEach(k => node.appendChild(k)); return node; }
  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Animate a numeric value; calls fn(value) each frame. Instant when reduced motion is preferred. */
  function tween(from, to, ms, fn, ease) {
    if (reducedMotion() || ms <= 0 || from === to) { fn(to); return; }
    const t0 = performance.now(); const e = ease || (t => 1 - Math.pow(1 - t, 3));
    function step(now) {
      const t = Math.min(1, Math.max(0, (now - t0) / ms)); fn(from + (to - from) * e(t));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Build a segmented control. opts: [{id,label,sub}] ; onChange(id) ; returns {root, set(id)} */
  function segmented(options, current, onChange, extraClass, label) {
    const root = el('div', { class: 'seg' + (extraClass ? ' ' + extraClass : ''), role: 'group', 'aria-label': label || null });
    const btns = {};
    options.forEach(o => {
      const b = el('button', { type: 'button', class: 'seg__btn', 'aria-pressed': String(o.id === current), 'data-id': o.id }, root);
      el('span', { class: 'seg__label', text: o.label }, b);
      if (o.sub) el('span', { class: 'seg__sub', text: o.sub }, b);
      b.addEventListener('click', () => { if (b.getAttribute('aria-pressed') === 'true') return; set(o.id); onChange(o.id); });
      btns[o.id] = b;
    });
    function set(id) { for (const k in btns) btns[k].setAttribute('aria-pressed', String(k === id)); }
    return { root, set };
  }

  return { svg, el, clear, tween, reducedMotion, segmented };
})();
