/* GRPO ablation training curves (with vs without std normalization), digitized from the vector PDF.
   Method: series polylines + y-axis tick marks parsed from `pdftocairo -svg figures/std_vs_nostd.pdf`;
   per-panel linear map SVG-y -> value fitted on the decoded tick labels; x mapped via the 0/10/20/30/39 tick marks.
   First/last values snapped to the numbers printed in the figure (all fitted within 0.0005 of them). */
window.ALPHABET_CURVES = {
  source: 'Digitized from figures/std_vs_nostd.pdf (paper Figure, GRPO ablation); endpoints calibrated to the printed values',
  steps: [0, 3, 7, 11, 15, 19, 23, 27, 31, 35, 39],
  brierReward: {
    brier:   { std: [0.731, 0.7208, 0.7021, 0.704, 0.6944, 0.6896, 0.7009, 0.7072, 0.7113, 0.7227, 0.715],
               noStd: [0.731, 0.7092, 0.6961, 0.7048, 0.6882, 0.694, 0.6908, 0.6824, 0.6761, 0.6769, 0.668] },
    logProb: { std: [-1.758, -1.696, -1.627, -1.63, -1.587, -1.582, -1.597, -1.633, -1.649, -1.754, -1.812],
               noStd: [-1.758, -1.661, -1.585, -1.609, -1.554, -1.568, -1.546, -1.544, -1.535, -1.519, -1.497] },
    acc:     { std: [0.416, 0.4287, 0.4431, 0.4391, 0.4497, 0.463, 0.4517, 0.4529, 0.4522, 0.4672, 0.473],
               noStd: [0.416, 0.4279, 0.445, 0.438, 0.4487, 0.4424, 0.4446, 0.4568, 0.4618, 0.4532, 0.457] },
  },
  logReward: {
    brier:   { std: [0.731, 0.7085, 0.7169, 0.7168, 0.7219, 0.7338, 0.7369, 0.7407, 0.7496, 0.7647, 0.774],
               noStd: [0.731, 0.7041, 0.6969, 0.6926, 0.6836, 0.6786, 0.6851, 0.6849, 0.6829, 0.6752, 0.681] },
    logProb: { std: [-1.758, -1.66, -1.652, -1.646, -1.67, -1.732, -1.752, -1.8, -1.847, -1.964, -2.106],
               noStd: [-1.758, -1.63, -1.581, -1.549, -1.532, -1.512, -1.527, -1.526, -1.537, -1.507, -1.519] },
    acc:     { std: [0.416, 0.4364, 0.4419, 0.4503, 0.442, 0.4492, 0.4513, 0.4673, 0.4635, 0.4589, 0.469],
               noStd: [0.416, 0.437, 0.4405, 0.4405, 0.4501, 0.4576, 0.4528, 0.4442, 0.4589, 0.4524, 0.451] },
  },
  // max |tick-calibrated value - printed value| over the shared start and both step-39 ends, before snapping
  residuals: {
    brierReward: { brier: 0.00045, logProb: 0.00045, acc: 0.00046 },
    logReward: { brier: 0.00028, logProb: 0.00047, acc: 0.00046 },
  },
};
