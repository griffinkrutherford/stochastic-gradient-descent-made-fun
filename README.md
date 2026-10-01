# Stochastic Gradient Descent Made Fun

An interactive worksheet about stochastic gradient descent and the math behind AI. The tabs at the top offer Algebra II, Calculus, high school Statistics, and Mathematical Modeling lessons, plus a playful **Beyond 3D** bonus expedition. In Statistics, the robot Byte learns to predict scores for the fictional arcade game Meteor Munch. Players' scorecards and practice rounds introduce sample means, residuals, random mini-batches, and fitting a line without calculus. The lesson then leads into the same marble bowl, word-feature map, training, and output-generation animations as the original lessons, with explanations grounded in prediction error and probability.

This is a static site: open `index.html` in a browser, or serve this directory with `python3 -m http.server` and visit `http://localhost:8000/`. Use the Statistics tab for an approximately one-class-period activity; students can check three short calculations, run the simulations, and compare their written explanations with the provided examples. The optional challenge extends the lesson to outliers and overshooting.

Allow roughly 30–35 minutes for Questions 1–8 and 15–20 minutes for the bowl-to-AI ending in Questions 9–12. The shared animations keep their controls and state when changing tabs. The header includes a pause/play control; animations start paused when the browser requests reduced motion. The physical bowl and word animations are labeled illustrations, while the earlier Statistics simulations calculate their updates from the displayed data.

All worksheet images and the favicon are in `assets/`. The page uses Google Fonts when online; it falls back to local system fonts offline. The “Back to Homepage” link points to [Griffin Rutherford's portfolio](https://griffinrutherford.com/).

The site can be published directly from the repository root with GitHub Pages; no build step is needed.

Algebra II and Calculus now check submitted responses instead of revealing the answer automatically. Short formulas accept equivalent arithmetic notation; written feedback uses local concept rules to identify ideas and offer hints, without assigning a grade. Example explanations remain independently available. Answers and feedback are saved separately for each version in the current browser. Enter checks a short answer; Ctrl/⌘ + Enter checks a written answer. Calculus uses a purple theme, while Algebra II retains red and Statistics uses green.

Run the numerical and feedback checks with `node --test tests/*.test.js`.

With the site served locally and Playwright installed, run `node tests/worksheet-animations.browser.cjs` to check shared canvases, mode changes, pause, reduced motion, and screen widths. Set `WORKSHEET_URL` to check a different local or published route, and optionally `CHROME_PATH` to use an installed Chrome executable.

Run `node tests/worksheet-practice.browser.cjs` with the same environment to check submissions, keyboard shortcuts, separate saved drafts, themes, and blocked-storage behavior.

The portfolio serves its own copy at `https://griffinrutherford.com/gradient-descent-worksheet/`. When publishing worksheet changes, also sync `index.html` and the root-level worksheet JavaScript/CSS files into that repository's `gradient-descent-worksheet/` directory, retaining its relative home and image paths.

The cyan **Modeling** tab is the Pop-Up Café Challenge: a fictional café at an arts night, designed for grades 11–12 in Introduction to Mathematical Modeling with Integrated III preparation. Students frame a decision, solve a demand-model system, fit seven pilot observations with real mini-batch updates, model revenue and cost, impose service capacity, test held-out similar-day and rainy-day observations, and defend a recommendation. Ten core questions take about 50–60 minutes including the shared bowl/AI ending. Optional digital-promotion and poster-photo missions use exponential functions and right-triangle trigonometry. Instructor notes, answer explanations, print styling, numeric tolerances, local draft saving, and clearly labeled concept feedback are included. All data are fictional. Classroom pacing still needs a teacher/student walkthrough.

Link directly to this lesson with `?version=modeling` (other supported values: `algebra`, `calculus`, and `statistics`, and `dimensions`). The published Modeling route is [Pop-Up Café Challenge](https://griffinrutherford.com/gradient-descent-worksheet/?version=modeling).

Run `node tests/modeling.browser.cjs` with the same browser environment to check the Modeling deep link, calculations, real seeded fitting, capacity decisions, held-out checks, saved drafts, keyboard controls, and mobile widths. The core Node checks also verify scaled coefficient gradients with finite differences, convergence to the known reference fit, seeded replay, and capacity-constrained profit.

Each lesson now starts with two interactive 3D visual laboratories: slope bridges and downhill terrain for Algebra II/Calculus, arcade score towers and a computed error bowl for Statistics, and price/capacity profit terrain plus a pilot-data fitting bowl for Modeling. Drag or use arrow keys to orbit, +/− to zoom, and Home to restore the camera. Turntables follow the shared pause/reduced-motion setting. Fitting scenes use the actual lesson data and update paths; supplementary profiles/contours and text summaries preserve their meaning from different views.

The [visual review gallery](visual-review/index.html) records 80 inspected screenshots and separate subjective aesthetics/interpretability scores. Run `node tests/visual-labs.browser.cjs` for linked mathematical states, camera controls, motion, print, and 32 early-scene captures; run `node tests/bowl-review.browser.cjs` for 16 bowl/theme/angle captures. Set `VISUAL_REVIEW_DIR` to choose a screenshot output directory. Scores require manual reassessment after changes. Include `visual-review/` when syncing the portfolio copy.

## Beyond 3D bonus expedition

The fifth **Bonus · Beyond 3D** tab (`?version=dimensions`) is a curiosity-driven, ungraded walkthrough with eight interactive stops: constructing dimensions, a ball visiting Flatland, depth-losing shadows, a genuinely rotated tesseract, cube/tesseract nets, 4D-ball slices, six-feature smoothie coordinates, and the extra-direction escape analogy. Its colors vary by stop; camera controls, numeric summaries, legends, analogy boundaries, pause/reduced motion, and print explanations are included. Coordinates, rotations, intersections, and distances are calculated locally without external rendering dependencies.

`node --test tests/*.test.js` includes topology, rotation-invariant distances, projections, known slices, net adjacency, hidden-feature distance, and the escape path. Run `node tests/dimensions.browser.cjs` with the same `WORKSHEET_URL`, `NODE_PATH`, `CHROME_PATH`, and `VISUAL_REVIEW_DIR` environment as the other browser tests. It checks the fifth-tab route, round trips to the existing lessons, preserved drafts, known mathematical states, camera/motion controls, phone widths, print, and 32 screenshots. The six-feature stop uses reference/hidden/mixed states rather than meaningless camera angles on its 2D diagrams.

**Review status:** all 24 numerical tests and the browser workflows passed. All 32 new full-card captures meet the existing 90/100 threshold on both subjective aesthetics and interpretability criteria. See [the bonus review notes](visual-review/DIMENSIONS_REVIEW.md). Browser checks include desktop, 390/320 px phone layouts, reduced motion, print, and the portfolio route.
