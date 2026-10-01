# Attention Machine visual review

Reviewed October 1, 2026. The sixth tab contains eight interactive studios, with 48 inspected captures: three desktop camera angles and a phone view per studio, eight revealing simulation states, and eight expanded-reasoning phone views. Every captured view reaches at least 92/100 for aesthetics and 95/100 for interpretability.

Scores are subjective coding-agent assessments, not independent teacher/student ratings. They apply to the linked captures, not a guarantee for every arbitrary orbit position. Full cards were checked for controls, text, legends, and numerical summaries; canvas contact sheets and enlarged reasoning sections supported detailed inspection. The gallery preserves the original full-card captures. A classroom walkthrough is still needed to assess pacing and comprehension.

Aesthetics weights: framing/composition 30; lighting/color/depth 25; visual hierarchy 25; controls/layout 20. Interpretability weights: mathematical mapping 35; axes/labels 25; numerical explanation 25; analogy limits 15. Each table cell is aesthetics / interpretability, out of 100.

| Studio | Perspective | Reverse | Overhead | Phone |
| --- | --- | --- | --- | --- |
| Start with the bowl. What is learning? | [94/97](attention-language-perspective.png) | [93/96](attention-language-reverse.png) | [94/97](attention-language-overhead.png) | [92/96](attention-language-phone.png) |
| Downhill toward… whose goal? | [94/97](attention-objective-perspective.png) | [93/96](attention-objective-reverse.png) | [94/97](attention-objective-overhead.png) | [92/96](attention-objective-phone.png) |
| A hate-watch still leaves a signal | [94/97](attention-ranking-perspective.png) | [93/96](attention-ranking-reverse.png) | [93/96](attention-ranking-overhead.png) | [92/95](attention-ranking-phone.png) |
| When approval trains the loop | [93/96](attention-outrage-perspective.png) | [94/97](attention-outrage-reverse.png) | [94/97](attention-outrage-overhead.png) | [92/96](attention-outrage-phone.png) |
| The surprise lives in the gap | [94/97](attention-surprise-perspective.png) | [94/97](attention-surprise-reverse.png) | [93/96](attention-surprise-overhead.png) | [92/95](attention-surprise-phone.png) |
| A feed can remove the finish line | [94/97](attention-stopping-perspective.png) | [93/96](attention-stopping-reverse.png) | [93/96](attention-stopping-overhead.png) | [92/95](attention-stopping-phone.png) |
| The feed teaches the feed | [94/98](attention-exposure-perspective.png) | [93/97](attention-exposure-reverse.png) | [94/98](attention-exposure-overhead.png) | [92/97](attention-exposure-phone.png) |
| Choose the bowl before choosing the downhill step | [94/97](attention-redesign-perspective.png) | [93/96](attention-redesign-reverse.png) | [94/97](attention-redesign-overhead.png) | [92/96](attention-redesign-phone.png) |

| Studio | Revealing state | Expanded reasoning · phone |
| --- | --- | --- |
| Start with the bowl. What is learning? | [94/97](attention-language-fit.png) | [92/97](attention-language-reasoning-phone.png) |
| Downhill toward… whose goal? | [94/97](attention-objective-reflection.png) | [92/97](attention-objective-reasoning-phone.png) |
| A hate-watch still leaves a signal | [94/97](attention-ranking-reflection.png) | [92/97](attention-ranking-reasoning-phone.png) |
| When approval trains the loop | [93/97](attention-outrage-neutral.png) | [92/97](attention-outrage-reasoning-phone.png) |
| The surprise lives in the gap | [93/97](attention-surprise-unrevealed.png) | [92/97](attention-surprise-reasoning-phone.png) |
| A feed can remove the finish line | [93/97](attention-stopping-no-friction.png) | [92/97](attention-stopping-reasoning-phone.png) |
| The feed teaches the feed | [94/98](attention-exposure-balanced.png) | [92/97](attention-exposure-reasoning-phone.png) |
| Choose the bowl before choosing the downhill step | [94/97](attention-redesign-best.png) | [92/97](attention-redesign-reasoning-phone.png) |

## Corrections from inspection

- Included floor-axis endpoints in adaptive camera bounds, preventing clipping beneath the language and objective bowls. Labeled A/B directions connect to the original variable names beside each scene.
- Repositioned viewer/ranker labels with collision checks and backplates, including the phone view. Directional arrows, moving pulses, and a stable post → response → future-exposure inset clarify the social loop.
- Marked unrevealed reward cards as unknown rather than zero; distinguished reward heights from learned expectation and prediction error.
- Began language training at equal probabilities, displayed the ten training rows and selected examples, and matched instructor answers to that initial state.
- Preserved the whole minimizing line in the no-evidence valley. Balanced observations introduce curvature; fitting on fixed observations moves the estimate on a fixed surface.
- Used a genuinely stepped design landscape and an explicit 121-setting search rather than depicting a smooth gradient where ranking changes discretely.
- Retained phone-readable bars, tables, controls, legends, and summaries alongside the 3D scenes. Surface height is described by the actual objective and reported numerically; camera height scaling is visual rather than an extra measured quantity.

## Validation

All 36 Node checks passed, including nine new attention-model checks. Analytic gradients agree with finite differences; full batches converge to known proportions; seeded mini-batches reproduce; stochastic updates can increase full-data loss; objective targets, clip rankings, reward arithmetic, continuation products, missing-data directions, and the 121-design minimum are verified.

The attention browser workflow passed on the standalone worksheet and the portfolio route. It checks all six tabs and preserved drafts, actual computed updates and rankings, seeded replay, selected rows, missing-data fitting, grid search, prediction feedback, blocked storage, pointer/keyboard camera controls, pause/single-step behavior, reduced motion, printing, and 320/390/768/1440-pixel layouts. Existing shared-animation and Beyond 3D workflows also passed after adding the tab. Captures use Chrome at desktop 1440 × 1100 and phone 390 × 844 with reduced motion for repeatable review.

Reproduce with a local server and Playwright:

```sh
node --test tests/*.test.js
WORKSHEET_URL=http://localhost:8000/ VISUAL_REVIEW_DIR=/tmp/attention-review node tests/attention.browser.cjs
```

Use `CHROME_PATH` for an installed Chrome executable and `NODE_PATH` if Playwright is installed outside the repository. Capture scripts never assign scores; regenerated images need fresh inspection.

## Evidence and analogy boundaries

Each relevant studio links to primary research and identifies the scope of that evidence. The token-prediction bowl connects to language-model training and the historical 2022 InstructGPT work; it does not claim to reproduce ChatGPT’s current proprietary recipe. Ranking, training, generation, and human learning remain distinct operations.

The outrage evidence concerns expression and social feedback, not a measurement of inner anger. Social-reward posting studies and curiosity experiments support specific mechanisms; their extension to scrolling is explicitly illustrative. The 2026 feed-ranking trial changed exposure without significantly changing participants’ own engagement behavior, a null result retained in the lecture. Reward units, continuation coefficients, reflection scores, and design penalties are invented classroom assumptions. “Brain rot” is slang, not a clinical diagnosis or proof of brain damage. A model’s numerical optimum cannot establish human benefit.
