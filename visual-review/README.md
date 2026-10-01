# Worksheet visual review

Reviewed September 30, 2026. 80 reviewed screenshots: 48 original lesson views and 32 Beyond 3D bonus views. Every reviewed view meets the 90/100 threshold for both criteria.

Scores are **subjective agent assessments**, not independent student/teacher validation. A 90-point view has readable controls and mathematical explanation, identifiable reference/current states, intentional framing, and no clipping or label collisions that obscure the lesson. Minor depth occlusion is acceptable when a labeled inset and numeric summary preserve the information.

Aesthetics weights: composition/framing 30; lighting/color/depth 25; hierarchy 25; controls/layout 20. Interpretability weights: mathematical mapping 35; axes/labels 25; numerical explanation 25; analogy limits 15.

Each cell is **aesthetics / interpretability**, out of 100, and links to the full-resolution original screenshot.

| Scene | Perspective | Reverse | Overhead | Phone |
| --- | --- | --- | --- | --- |
| Algebra II · slope bridge | [92/94](algebra-bridge-perspective.png) | [90/91](algebra-bridge-reverse.png) | [92/94](algebra-bridge-overhead.png) | [90/93](algebra-bridge-phone.png) |
| Algebra II · downhill scout | [92/94](algebra-terrain-perspective.png) | [92/92](algebra-terrain-reverse.png) | [94/95](algebra-terrain-overhead.png) | [91/93](algebra-terrain-phone.png) |
| Calculus · secant to tangent | [93/95](calculus-bridge-perspective.png) | [90/93](calculus-bridge-reverse.png) | [93/95](calculus-bridge-overhead.png) | [91/94](calculus-bridge-phone.png) |
| Calculus · gradient terrain | [94/95](calculus-terrain-perspective.png) | [93/94](calculus-terrain-reverse.png) | [94/95](calculus-terrain-overhead.png) | [91/93](calculus-terrain-phone.png) |
| Statistics · arcade score skyline | [92/94](statistics-skyline-perspective.png) | [91/93](statistics-skyline-reverse.png) | [92/93](statistics-skyline-overhead.png) | [90/92](statistics-skyline-phone.png) |
| Statistics · prediction-error bowl | [95/95](statistics-fit-perspective.png) | [92/92](statistics-fit-reverse.png) | [94/94](statistics-fit-overhead.png) | [91/93](statistics-fit-phone.png) |
| Modeling · café profit landscape | [94/95](modeling-market-perspective.png) | [93/94](modeling-market-reverse.png) | [92/94](modeling-market-overhead.png) | [91/93](modeling-market-phone.png) |
| Modeling · café fitting bowl | [94/95](modeling-fit-perspective.png) | [92/93](modeling-fit-reverse.png) | [94/95](modeling-fit-overhead.png) | [91/93](modeling-fit-phone.png) |
| Algebra · marble bowl | [93/94](algebra-shared-bowl-perspective.png) | [92/93](algebra-shared-bowl-reverse.png) | [93/94](algebra-shared-bowl-overhead.png) | [90/92](algebra-shared-bowl-phone.png) |
| Calculus · marble bowl | [93/94](calculus-shared-bowl-perspective.png) | [92/93](calculus-shared-bowl-reverse.png) | [93/94](calculus-shared-bowl-overhead.png) | [90/92](calculus-shared-bowl-phone.png) |
| Statistics · marble bowl | [93/94](statistics-shared-bowl-perspective.png) | [92/93](statistics-shared-bowl-reverse.png) | [93/94](statistics-shared-bowl-overhead.png) | [90/92](statistics-shared-bowl-phone.png) |
| Modeling · marble bowl | [93/94](modeling-shared-bowl-perspective.png) | [92/93](modeling-shared-bowl-reverse.png) | [93/94](modeling-shared-bowl-overhead.png) | [90/92](modeling-shared-bowl-phone.png) |

## Review-driven corrections

- Shallow curve ribbons, visible rise/run markers, and 2D side profiles preserve bridge meaning from reverse angles.
- Adaptive camera framing keeps mesh extremes, wells, and paths inside the scene.
- Label collision avoidance and contour/side insets clarify depth without competing with axes.
- Responsive canvas resizing, selected-player residual summaries, and phone-friendly controls improve small-screen reading.
- The shared bowl explicitly distinguishes physical shaking from real randomly sampled SGD updates.
- Print-hidden canvases are excluded from redraws; reduced motion and global pause freeze decorative animation while leaving numerical step controls usable.

Chrome captures: desktop 1440 × 1100; phone 390 × 844. The images document the tested angles; arbitrary camera positions are user-controllable. Tests also cover 320-pixel layouts, keyboard use, actual coefficient updates, linked planning controls, seeded replay, and print behavior. Classroom pacing and comprehension still need a teacher/student walkthrough.

Regenerate early-scene screenshots with `tests/visual-labs.browser.cjs` and bowl captures with `tests/bowl-review.browser.cjs` using the documented browser environment. New captures require visual reassessment; the script does not award scores.

## Beyond 3D bonus

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

See [the bonus review notes](DIMENSIONS_REVIEW.md) for states, corrections, and validation.
