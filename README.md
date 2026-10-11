# AlphaBet — project website

Static site for *AlphaBet: Reinforcement Learning for LLM Event Forecasting Agents*.
Plain HTML, CSS and JavaScript; no build step. Fonts (Newsreader, Public Sans, IBM Plex Mono)
and KaTeX load from CDNs; everything else is local.

## Preview locally

```sh
cd website
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly from disk also works.

## Deploy on GitHub Pages

Push the contents of this folder to the branch/folder that Pages serves (for example the
`gh-pages` branch, or `main` with `/docs` — rename the folder to `docs` in that case).
`.nojekyll` is included so Pages serves the files as-is.

## Things to fill in when they exist

| What | Where |
| --- | --- |
| arXiv URL, GitHub URL, Hugging Face URL | `assets/js/main.js`, the `LINKS` object at the top. While `paper.href` is empty the Paper pill falls back to the paper section at the bottom of the page; set it to the arXiv URL to make it external. The header "Paper" link follows the same object. The data pill is labeled "Data & Models" and currently points to the Forecast-Dojo dataset; repoint it when the AlphaBet page exists. |
| BibTeX (arXiv id, venue) | `index.html`, the `<pre id="bibtex">` block in the Cite section. |
| Social preview image | add `<meta property="og:image" content="…">` in `index.html` once the page has a public URL. |

## Design decisions worth knowing

- Numbered blocks (01 result · 02 idea · 03 two propositions · 04 analysis · 05 in short) on alternating paper bands; tinted bands are a soft parchment (#f2ede2) with slightly deeper panels (#ebe5d6), alternating with the warm ivory paper; the deep green lives in the ink and the dark paper block only, never white plates.
- Blue means AlphaBet and nothing else; the warm tone marks the resolved outcome; grays are everything else.
- Both Brier charts follow the paper's orientation: Brier increases upward, so lower-right is better.
- The hero schematic, the Brier flip and the Proposition 2 calculator are labeled illustrative on the page.
- Headless Chrome enforces a 500px minimum window; to preview phone widths, open the page inside an iframe of the desired width.

## Where the numbers come from

Every number shown by a widget or table is read from `assets/js/data.js`, which transcribes
`tables/main_table.tex`, `tables/gain_analysis.tex`, `tables/horzion_analysis.tex`,
`tables/grpo_evaluation_diagnostics.tex`, the split/distribution tables, and the labeled
endpoints of the training-curve figures. Numbers written directly in `index.html`
(hero, callouts, captions, caveats) are the same values and should be changed together.

The episode in block 02 uses a real Polymarket question and its real outcome; the four forecast dates and the
probability bars are illustrative placeholders and labeled as such (replace `EPISODE.steps` in `episode.js` with the
real schedule and reports to drop the label). The Proposition 2 mini-figure in block 03 is illustrative too.

## Files

```
index.html              page structure and copy
assets/css/style.css    design tokens (:root), layout, components, widget styles
assets/js/data.js       ground-truth numbers from the paper
assets/js/math.js       Brier, tilted target, scales, entropy
assets/js/dom.js        tiny DOM/SVG helpers, segmented control, tween
assets/js/logos.js      model icons extracted from the paper's Figure 1 (currentColor vector symbols)
assets/js/curves.js     GRPO training curves digitized from the paper's figure (endpoints = printed values)
assets/logo.svg         the mark: an alpha whose tail rises to a terracotta point (also inlined in the header and favicon)
assets/logo/            the same mark as standalone files (light, dark, 'two outcomes' variant) and the comparison sheets from the design exploration
assets/js/episode.js    block 02: one training episode — environment band, agent loop, forecasts, outcome,
                        scores, training rail (EPISODE object at the top; replace steps[].date/p with a real
                        schedule and trajectory to drop the "illustrative" label)
assets/js/compass.js    block 01: two Figure-1-style panels (Forecast-Dojo, FutureX) with icons and the arrow
assets/js/swap.js       block 04: evidence × reader table + readout (gain analysis)
assets/js/horizon.js    block 04.1: Brier by days to settlement
assets/js/grpo-curves.js block 04.3: native redraw of the training curves from curves.js
assets/js/grpo-diag.js  block 04.3: std vs no-std diagnostics at step 39
assets/js/table.js      collapsed Table 1
assets/js/main.js       links, header, widget mounting, KaTeX, BibTeX copy
assets/figures/         three paper figures converted from PDF to SVG and recolored to the site palette
                        (std_vs_nostd, validation_loss, overview) plus the teaser PNGs for a future og:image
```
