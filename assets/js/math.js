/* Pure helpers shared by the interactive widgets. No DOM here. */
window.ABMath = (function () {
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const sum = a => a.reduce((s, v) => s + v, 0);
  const normalize = a => { const s = sum(a); return s > 0 ? a.map(v => v / s) : a.map(() => 1 / a.length); };

  /* Multiclass Brier loss of report p against realized class y (0-indexed). Range [0, 2]. */
  function brier(p, y) { return p.reduce((s, v, k) => s + (v - (k === y ? 1 : 0)) ** 2, 0); }

  /* Expected Brier discrepancy D_S(q, p) = ||q - p||^2 (Appendix A.3). */
  function brierDiscrepancy(q, p) { return q.reduce((s, v, k) => s + (v - p[k]) ** 2, 0); }

  /* Proposition 2(ii): tilted reporting target under GRPO std normalization.
     q_tilde(k) ∝ q(k) / (sigma_k + eps). */
  function tiltedTarget(q, sigma, eps) {
    const w = q.map((qk, k) => qk / (sigma[k] + eps));
    return normalize(w);
  }

  /* Shannon entropy in nats. */
  function entropy(p) { return -p.reduce((s, v) => s + (v > 0 ? v * Math.log(v) : 0), 0); }

  /* Linear scale factory. */
  function scale(d0, d1, r0, r1) {
    const f = x => r0 + (x - d0) * (r1 - r0) / (d1 - d0);
    f.invert = y => d0 + (y - r0) * (d1 - d0) / (r1 - r0);
    return f;
  }

  /* Nice ticks between lo and hi with roughly n steps. */
  function ticks(lo, hi, n) {
    const span = hi - lo; const raw = span / n;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag; const step = (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag;
    const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  const fmt = { pct: v => v.toFixed(1), brier: v => v.toFixed(3), signed: (v, d = 3) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(d) };

  /* Ease helpers for small animations. */
  const ease = { inOut: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t), out: t => 1 - Math.pow(1 - t, 3) };

  return { clamp, sum, normalize, brier, brierDiscrepancy, tiltedTarget, entropy, scale, ticks, fmt, ease };
})();
