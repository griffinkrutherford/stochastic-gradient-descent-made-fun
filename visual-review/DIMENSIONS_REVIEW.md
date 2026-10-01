# Beyond 3D visual review

Reviewed September 30, 2026 in Chrome. All 32 full-card captures meet **90/100 for both aesthetics and interpretability** under the existing rubric. These are subjective coding-agent assessments, not independent student or teacher validation.

Aesthetics: composition/framing 30; color/depth 25; hierarchy 25; controls/layout 20. Interpretability: mathematical mapping 35; axes/labels 25; numerical explanation 25; analogy limits 15.

Desktop captures use 1440 × 1100; phone captures use 390 × 844. Browser checks also cover 320 px, keyboard cameras, projection and slice states, all five tabs, saved-draft round trips, pause/reduced motion, and print. The features studio uses reference/hidden/mixed coordinate states rather than camera views.

Each cell is **aesthetics / interpretability** and links to the full-card screenshot.

| Stop | Perspective / reference | Reverse / hidden | Overhead / mixed | Phone |
| --- | --- | --- | --- | --- |
| Build a dimension | [94/95](dimensions-ladder-perspective.png) | [93/94](dimensions-ladder-reverse.png) | [92/93](dimensions-ladder-overhead.png) | [93/95](dimensions-ladder-phone.png) |
| A visitor to Flatland | [94/96](dimensions-slice-perspective.png) | [93/95](dimensions-slice-reverse.png) | [92/95](dimensions-slice-overhead.png) | [93/96](dimensions-slice-phone.png) |
| A shadow forgets something | [93/96](dimensions-shadow-perspective.png) | [93/96](dimensions-shadow-reverse.png) | [91/94](dimensions-shadow-overhead.png) | [93/96](dimensions-shadow-phone.png) |
| Turn in a direction you cannot point | [95/96](dimensions-tesseract-perspective.png) | [94/95](dimensions-tesseract-reverse.png) | [93/94](dimensions-tesseract-overhead.png) | [93/95](dimensions-tesseract-phone.png) |
| Open the box. Then open the next box. | [93/94](dimensions-net-perspective.png) | [92/93](dimensions-net-reverse.png) | [91/92](dimensions-net-overhead.png) | [92/94](dimensions-net-phone.png) |
| A 4D visitor to our world | [92/95](dimensions-hypersphere-perspective.png) | [92/95](dimensions-hypersphere-reverse.png) | [91/94](dimensions-hypersphere-overhead.png) | [92/95](dimensions-hypersphere-phone.png) |
| Six dimensions can taste like a smoothie | [92/95](dimensions-features-reference.png) | [93/96](dimensions-features-hidden.png) | [94/96](dimensions-features-mixed.png) | [92/95](dimensions-features-phone.png) |
| The extra-direction trick | [94/95](dimensions-escape-perspective.png) | [93/94](dimensions-escape-reverse.png) | [92/94](dimensions-escape-overhead.png) | [93/95](dimensions-escape-phone.png) |

Review-driven corrections separated the Flatland radius caption, shadow caption, and radar labels; added the radar zero reference; expanded phone canvas heights; and labeled all eight net cells. Nets retain normal 3D occlusion, with distinct colors, an explicit coordinate legend, and a separation slider for inspection. All stops state the limits of their analogy and distinguish slices, projections, and nets.

Numerical tests and browser checks cover calculated rotations, topology, slices, feature distances, and the boundary-bypassing path. Existing practice, modeling, shared-animation, early 3D scene, and bowl workflows were rerun. The portfolio route was checked separately. The camera remains freely adjustable; these grades certify the captured views, not every possible camera setting.

Regenerate with `tests/dimensions.browser.cjs`. The script captures screenshots and tests behavior; it does not award visual grades.
