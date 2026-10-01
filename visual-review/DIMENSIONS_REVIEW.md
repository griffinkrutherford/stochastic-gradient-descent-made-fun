# Beyond 3D visual review

Reviewed October 1, 2026 in Chrome. All **44 refreshed captures** meet 90/100 for both aesthetics and interpretability: 32 camera/state views, eight expanded-reasoning phone views, and four high-dimensional-volume views. Scores are subjective coding-agent assessments, not independent student or teacher validation.

Aesthetics: composition/framing 30; color/depth 25; hierarchy 25; controls/layout 20. Interpretability: mathematical mapping 35; axes/labels 25; numerical explanation 25; analogy limits 15. Desktop viewport: 1440 × 1100; phone: 390 × 844. Layout behavior is also checked at 320 and 768 pixels.

Each cell is **aesthetics / interpretability**, out of 100, with the original full-resolution capture.

| Stop | Perspective / reference | Reverse / hidden | Overhead / mixed | Phone |
| --- | --- | --- | --- | --- |
| A dimension is a new freedom | [94/97](dimensions-ladder-perspective.png) | [93/96](dimensions-ladder-reverse.png) | [92/95](dimensions-ladder-overhead.png) | [93/96](dimensions-ladder-phone.png) |
| An apparent transformation can be a slice | [94/97](dimensions-slice-perspective.png) | [93/96](dimensions-slice-reverse.png) | [92/96](dimensions-slice-overhead.png) | [93/96](dimensions-slice-phone.png) |
| A shadow loses an address | [93/97](dimensions-shadow-perspective.png) | [93/97](dimensions-shadow-reverse.png) | [91/96](dimensions-shadow-overhead.png) | [93/97](dimensions-shadow-phone.png) |
| Turn two coordinates; preserve the object | [95/98](dimensions-tesseract-perspective.png) | [94/97](dimensions-tesseract-reverse.png) | [93/97](dimensions-tesseract-overhead.png) | [93/96](dimensions-tesseract-phone.png) |
| The boundary has one fewer freedom | [93/96](dimensions-net-perspective.png) | [92/95](dimensions-net-reverse.png) | [91/94](dimensions-net-overhead.png) | [92/95](dimensions-net-phone.png) |
| The same budget, one dimension higher | [92/97](dimensions-hypersphere-perspective.png) | [92/97](dimensions-hypersphere-reverse.png) | [91/96](dimensions-hypersphere-overhead.png) | [92/96](dimensions-hypersphere-phone.png) |
| A recipe is a point. An error is a height. | [93/97](dimensions-features-reference.png) | [94/98](dimensions-features-hidden.png) | [95/98](dimensions-features-mixed.png) | [92/97](dimensions-features-phone.png) |
| A barrier depends on the allowed space | [94/97](dimensions-escape-perspective.png) | [93/97](dimensions-escape-reverse.png) | [93/96](dimensions-escape-overhead.png) | [93/97](dimensions-escape-phone.png) |

All eight expanded-reasoning phone captures score **92/97**. Open them from the [gallery](index.html) or [score manifest](scores.json).

| Volume experiment | Aesthetics / interpretability |
| --- | --- |
| 3 dimensions | [93/97](dimensions-volume-3.png) |
| 10 dimensions | [93/97](dimensions-volume-10.png) |
| 100 dimensions | [92/96](dimensions-volume-100.png) |
| Phone, 10 dimensions | [92/96](dimensions-volume-phone.png) |

Review found and corrected a crowded rotation-axis label and an escape path clipped from some camera angles. The path now contributes to camera bounds; the tracked-corner circle has separate labels. Exact coordinate steps retain fractional precision, and the ink-crossing preset uses the calculated crossing rather than a rounded slider value. The volume bar has a matching legend and precise percentage summary; tiny volume fractions are not artificially enlarged.

The reasoning now connects independent coordinates, copy-and-connect counting, section distance budgets, projection fibers, rotation invariants, boundary constraints, hidden error contributions, and allowed-path constraints. The six-feature experiment accounts for every squared contribution, counts repeated map axes only once, and distinguishes a dependent error height from an independent parameter. Each scene explicitly describes the limits of its analogy.

All 27 numerical tests pass. Browser checks cover eight studios, actual presets and updates, edge-length invariants, volume fractions, prediction feedback, keyboard cameras, all five tabs, preserved drafts, pause/reduced motion, phone layouts, and print. Shared-animation regression checks also pass. Free camera controls allow other positions: these grades apply to the captured views, not every possible camera setting. Classroom pacing and comprehension still require a teacher/student walkthrough.

Regenerate with `tests/dimensions.browser.cjs`. It tests behavior and captures screenshots; visual scores require manual reassessment.
