/* AlphaBet paper website — ground-truth numbers transcribed from the arXiv LaTeX sources.
   Sources: tables/main_table.tex, tables/gain_analysis.tex, tables/horzion_analysis.tex,
   tables/grpo_evaluation_diagnostics.tex, tables/experimental_splits.tex,
   tables/experimental_distributions.tex, sections-arxiv/04_exp.tex, figures/*.pdf */
window.ALPHABET_DATA = {
  // Main results. ci = 95% CI (event-clustered bootstrap for Forecast-Dojo; item bootstrap for FutureX)
  main: [
    { id: 'uniform',     name: 'Uniform reference',          group: 'ref',  dojo: { acc: 22.9, accCI: [20.8, 25.1], brier: 0.771, brierCI: [0.749, 0.792], negInfoAlpha: 0.727, negInfoAlphaCI: [0.624, 0.830] }, futurex: { acc: 30.6, accCI: [28.7, 32.4], brier: 0.680, brierCI: [0.662, 0.699] } },
    { id: 'sonnet-high', name: 'Claude Sonnet 4.6', variant: 'high',  group: 'frontier', dojo: { acc: 50.0, accCI: [44.5, 55.5], brier: 0.624, brierCI: [0.573, 0.675], negInfoAlpha: 0.364, negInfoAlphaCI: [0.253, 0.480] }, futurex: { acc: 58.9, accCI: [54.2, 63.6], brier: 0.497, brierCI: [0.444, 0.552] } },
    { id: 'kimi',        name: 'Kimi K2.5',                  group: 'frontier', dojo: { acc: 48.9, accCI: [43.8, 54.3], brier: 0.663, brierCI: [0.614, 0.710], negInfoAlpha: 0.530, negInfoAlphaCI: [0.414, 0.650] }, futurex: { acc: 57.5, accCI: [53.0, 61.9], brier: 0.514, brierCI: [0.464, 0.564] } },
    { id: 'qwen',        name: 'Qwen3.5-397B-A17B', variant: 'think', group: 'frontier', dojo: { acc: 48.2, accCI: [43.1, 53.5], brier: 0.653, brierCI: [0.606, 0.704], negInfoAlpha: 0.482, negInfoAlphaCI: [0.373, 0.608] }, futurex: { acc: 57.1, accCI: [52.5, 61.5], brier: 0.556, brierCI: [0.503, 0.607] } },
    { id: 'sonnet-low',  name: 'Claude Sonnet 4.6', variant: 'low',   group: 'frontier', dojo: { acc: 47.6, accCI: [41.6, 53.2], brier: 0.656, brierCI: [0.598, 0.714], negInfoAlpha: 0.468, negInfoAlphaCI: [0.346, 0.604] }, futurex: { acc: 54.2, accCI: [49.4, 59.1], brier: 0.564, brierCI: [0.506, 0.619] } },
    { id: 'minimax',     name: 'MiniMax-M2.5',               group: 'frontier', dojo: { acc: 45.9, accCI: [40.9, 51.2], brier: 0.719, brierCI: [0.670, 0.768], negInfoAlpha: 0.738, negInfoAlphaCI: [0.608, 0.873] }, futurex: { acc: 53.3, accCI: [48.8, 57.7], brier: 0.555, brierCI: [0.505, 0.606] } },
    { id: 'glm',         name: 'GLM-4.5-Air',                group: 'base', dojo: { acc: 41.6, accCI: [36.6, 46.9], brier: 0.731, brierCI: [0.685, 0.777], negInfoAlpha: 0.726, negInfoAlphaCI: [0.616, 0.877] }, futurex: { acc: 51.3, accCI: [47.0, 55.5], brier: 0.612, brierCI: [0.561, 0.664] } },
    { id: 'blf',         name: '+BLF',                       group: 'baseline', dojo: { acc: 45.8, accCI: [40.5, 51.4], brier: 0.671, brierCI: [0.630, 0.711], negInfoAlpha: 0.458, negInfoAlphaCI: [0.365, 0.555] }, futurex: { acc: 51.1, accCI: [45.9, 56.2], brier: 0.592, brierCI: [0.547, 0.639] } },
    { id: 'openforecaster', name: '+OpenForecaster',         group: 'baseline', dojo: { acc: 42.8, accCI: [38.0, 48.1], brier: 0.765, brierCI: [0.719, 0.809], negInfoAlpha: 0.845, negInfoAlphaCI: [0.742, 0.957] }, futurex: { acc: 52.6, accCI: [48.5, 56.7], brier: 0.583, brierCI: [0.545, 0.622] } },
    { id: 'ab-single',   name: '+AlphaBet', variant: 'single-date', group: 'ours', dojo: { acc: 47.2, accCI: [42.1, 52.3], brier: 0.668, brierCI: [0.619, 0.714], negInfoAlpha: 0.507, negInfoAlphaCI: [0.406, 0.619] }, futurex: { acc: 53.2, accCI: [48.7, 57.7], brier: 0.540, brierCI: [0.494, 0.590] } },
    { id: 'ab-memory',   name: '+AlphaBet', variant: 'memory-on',   group: 'ours', dojo: { acc: 49.3, accCI: [43.7, 54.7], brier: 0.630, brierCI: [0.577, 0.685], negInfoAlpha: 0.413, negInfoAlphaCI: [0.313, 0.516] }, futurex: { acc: 55.2, accCI: [50.4, 59.8], brier: 0.545, brierCI: [0.499, 0.592] } },
    { id: 'ab-free',     name: '+AlphaBet', variant: 'memory-free', group: 'ours', best: true, dojo: { acc: 50.5, accCI: [45.3, 55.9], brier: 0.626, brierCI: [0.574, 0.677], negInfoAlpha: 0.399, negInfoAlphaCI: [0.304, 0.502] }, futurex: { acc: 57.9, accCI: [53.4, 62.4], brier: 0.528, brierCI: [0.483, 0.576] } },
  ],
  teaserDeltas: { dojo: { accPP: 8.9, brierRelPct: -14.4 }, futurex: { accPP: 6.6, brierRelPct: -13.7 } },

  // Gain analysis (Brier, Forecast-Dojo test; frozen evidence sets × tool-free readers)
  gain: {
    readers: [
      { id: 'gpt',    name: 'GPT-5.6 Terra', variant: 'xhigh', hBase: 0.623, hBaseCI: [0.576, 0.671], hAB: 0.612, hABCI: [0.566, 0.659], none: 0.725, noneCI: [0.673, 0.778], dAcq: 0.011, dAcqSig: '*' },
      { id: 'sonnet', name: 'Claude Sonnet 4.6', variant: 'high', hBase: 0.649, hBaseCI: [0.600, 0.701], hAB: 0.638, hABCI: [0.590, 0.688], none: 0.763, noneCI: [0.709, 0.815], dAcq: 0.012, dAcqSig: '*' },
      { id: 'glm',    name: 'GLM-4.5-Air', hBase: 0.702, hBaseCI: [0.661, 0.743], hAB: 0.686, hABCI: [0.644, 0.727], none: 0.801, noneCI: [0.755, 0.847], dAcq: 0.016, dAcqSig: '**' },
      { id: 'ab',     name: '+AlphaBet', variant: 'memory-free', hBase: 0.642, hBaseCI: [0.592, 0.694], hAB: 0.628, hABCI: [0.575, 0.681], none: 0.765, noneCI: [0.713, 0.816], dAcq: 0.014, dAcqSig: '*' },
    ],
    dReport: { hBase: { v: 0.060, sig: '***' }, hAB: { v: 0.058, sig: '***' }, none: { v: 0.035, sig: '**' } },
    reportsPerCondition: 12752, questionOnlyReports: 3188,
  },

  // Brier by forecast horizon (Forecast-Dojo test split)
  horizon: [
    { id: 'lt3',  label: '< 3 days',   n: 76,  base: 0.734, baseCI: [0.652, 0.813], single: 0.663, singleCI: [0.579, 0.740], free: 0.646, freeCI: [0.551, 0.733], longGain: 0.017 },
    { id: '3to7', label: '3–7 days',   n: 405, base: 0.775, baseCI: [0.733, 0.817], single: 0.728, singleCI: [0.683, 0.772], free: 0.693, freeCI: [0.640, 0.744], longGain: 0.035 },
    { id: '7to14', label: '7–14 days', n: 204, base: 0.634, baseCI: [0.572, 0.700], single: 0.576, singleCI: [0.509, 0.643], free: 0.525, freeCI: [0.435, 0.610], longGain: 0.051 },
    { id: 'gt14', label: '> 14 days',  n: 112, base: 0.692, baseCI: [0.550, 0.840], single: 0.626, singleCI: [0.493, 0.765], free: 0.554, freeCI: [0.431, 0.694], longGain: 0.072 },
  ],

  // GRPO std-normalization ablation (Forecast-Dojo, step 39, common-valid forecasts)
  grpo: {
    curvesNote: 'Values read from figures/std_vs_nostd.pdf (start → end of training, step 0 → 39)',
    brierReward: { start: { brier: 0.731, log: -1.758, acc: 0.416 }, std: { brier: 0.715, log: -1.812, acc: 0.473 }, noStd: { brier: 0.668, log: -1.497, acc: 0.457 },
      dBrier: 0.050, dBrierSig: '*', dLog: 0.326, dLogSig: '***', rel: { std: 0.054, noStd: 0.004 }, res: { std: 0.207, noStd: 0.204 }, unc: { std: 0.872, noStd: 0.871 },
      decompBrier: { std: 0.719, noStd: 0.671 }, calErr: { std: 0.192, noStd: 0.034 }, meanMaxProb: { std: 0.665, noStd: 0.470 }, entropy: { std: 0.896, noStd: 1.370 },
      invalid: { std: 121, noStd: 3 }, allBrier: { std: 0.763, noStd: 0.673 }, allLog: { std: -2.005, noStd: -1.515 } },
    logReward:   { start: { brier: 0.731, log: -1.758, acc: 0.416 }, std: { brier: 0.774, log: -2.106, acc: 0.469 }, noStd: { brier: 0.681, log: -1.519, acc: 0.451 },
      dBrier: 0.093, dBrierSig: '***', dLog: 0.589, dLogSig: '***', rel: { std: 0.095, noStd: 0.007 }, res: { std: 0.189, noStd: 0.193 }, unc: { std: 0.871, noStd: 0.871 },
      decompBrier: { std: 0.777, noStd: 0.685 }, calErr: { std: 0.260, noStd: 0.043 }, meanMaxProb: { std: 0.728, noStd: 0.416 }, entropy: { std: 0.742, noStd: 1.491 },
      invalid: { std: 10, noStd: 13 }, allBrier: { std: 0.779, noStd: 0.687 }, allLog: { std: -2.127, noStd: -1.542 } },
    totalForecasts: 3188, commonValid: { brierReward: 3064, logReward: 3165 }, accP: { brierReward: 0.099, logReward: 0.114 },
  },

  // Data & training facts
  splits: {
    train: { events: 1028, steps: 3965, binary: 383, multi: 645, meanOutcomes: 5.54, meanSteps: 3.86, stepsRange: [3, 10], medianHorizonDays: 8 },
    val:   { events: 80,   steps: 344,  binary: 14,  multi: 66,  meanOutcomes: 7.56, meanSteps: 4.30, stepsRange: [3, 10], medianHorizonDays: 10 },
    test:  { events: 230,  steps: 797,  binary: 40,  multi: 190, meanOutcomes: 7.93, meanSteps: 3.47, stepsRange: [3, 8],  medianHorizonDays: 6 },
  },
  domains: [
    { name: 'Sports', train: 256, val: 25, test: 56 }, { name: 'Cryptocurrency', train: 189, val: 6, test: 55 }, { name: 'Finance', train: 173, val: 8, test: 19 },
    { name: 'Politics', train: 130, val: 10, test: 40 }, { name: 'Geopolitics', train: 115, val: 6, test: 20 }, { name: 'Popular culture', train: 107, val: 11, test: 26 },
    { name: 'Technology', train: 35, val: 6, test: 5 }, { name: 'Science, health & weather', train: 22, val: 8, test: 8 }, { name: 'Crime & society', train: 1, val: 0, test: 1 },
  ],
  horizonDist: [ { label: 'h < 3', train: 338, val: 26, test: 76 }, { label: '3 ≤ h ≤ 7', train: 1625, val: 97, test: 405 }, { label: '7 < h ≤ 14', train: 988, val: 103, test: 204 }, { label: 'h > 14', train: 1014, val: 118, test: 112 } ],
  training: { policy: 'GLM-4.5-Air (106B total / 12B active)', checkpointRelease: '2025-07-28', trainWindow: ['2025-08-01', '2026-02-28'], valWindow: ['2026-01-01', '2026-02-28'], testWindow: ['2026-03', '2026-05'],
    corpus: 'CC-News, March 2025–May 2026', articles: '18.8M article embeddings', retriever: 'Qwen3-Embedding-8B + FAISS GPU index', G: 16, toolBudget: '80 rounds · 200 calls per forecast date',
    gpus: '128 × H200 (16 nodes × 8) for training + rollouts; 8 more for retrieval', wallClock: '≈ 62 hours for a 120-step memory-free run', memoryOnCost: '≈ 2.3× longer per step',
    lr: '10⁻⁶, constant', clip: [0.20, 0.28], kl: 0, entropy: 0, reward: 'negative multiclass Brier + format penalties', advantage: 'group-mean centering, no std normalization' },
  futurex: { items: 343, l1: 178, l2: 165, yesno: 138, mc: 193, freeform: 12 },
  validation: { brierStart: 0.734, brierSelected: 0.669, brierFinal: 0.681, accStart: 0.420, accSelected: 0.495, accFinal: 0.472, selectedStep: 103 },
  toolCalls: { base: 12.4, openforecaster: 8.3 },
};
