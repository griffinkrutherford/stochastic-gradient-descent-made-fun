# Stochastic Gradient Descent Made Fun

An interactive worksheet about stochastic gradient descent and the math behind AI. The tabs at the top offer Algebra II, Calculus, and a high school Statistics lesson. The Statistics tab uses a fictional class dataset to explore sample means, residuals, random mini-batches, and fitting a line without calculus. It then leads into the same marble bowl, word-feature map, training, and output-generation animations as the original lessons, with explanations grounded in prediction error and probability.

This is a static site: open `index.html` in a browser, or serve this directory with `python3 -m http.server` and visit `http://localhost:8000/`. Use the Statistics tab for an approximately one-class-period activity; students can check three short calculations, run the simulations, and compare their written explanations with the provided examples. The optional challenge extends the lesson to outliers and overshooting.

Allow roughly 30–35 minutes for Questions 1–8 and 15–20 minutes for the bowl-to-AI ending in Questions 9–12. The shared animations keep their controls and state when changing tabs. The header includes a pause/play control; animations start paused when the browser requests reduced motion. The physical bowl and word animations are labeled illustrations, while the earlier Statistics simulations calculate their updates from the displayed data.

All worksheet images and the favicon are in `assets/`. The page uses Google Fonts when online; it falls back to local system fonts offline. The “Back to Homepage” link points to [Griffin Rutherford's portfolio](https://griffinrutherford.com/).

The site can be published directly from the repository root with GitHub Pages; no build step is needed.

Run the numerical checks with `node --test tests/statistics-core.test.js`.

With the site served locally and Playwright installed, run `node tests/worksheet-animations.browser.cjs` to check shared canvases, mode changes, pause, reduced motion, and screen widths. Set `WORKSHEET_URL` to check a different local or published route, and optionally `CHROME_PATH` to use an installed Chrome executable.

The portfolio serves its own copy at `https://griffinrutherford.com/gradient-descent-worksheet/`. When publishing worksheet changes, also sync `index.html`, `statistics-core.js`, `statistics.js`, `statistics.css`, and `worksheet-animations.js` into that repository's `gradient-descent-worksheet/` directory, retaining its relative home and image paths.
