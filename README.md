# Stochastic Gradient Descent Made Fun

An interactive worksheet about stochastic gradient descent and the math behind AI. The tabs at the top offer Algebra II, Calculus, and a high school Statistics lesson. The Statistics tab uses a fictional class dataset to explore sample means, residuals, random mini-batches, and fitting a line without calculus.

This is a static site: open `index.html` in a browser, or serve this directory with `python3 -m http.server` and visit `http://localhost:8000/`. Use the Statistics tab for an approximately one-class-period activity; students can check three short calculations, run the simulations, and compare their written explanations with the provided examples. The optional challenge extends the lesson to outliers and overshooting.

All worksheet images and the favicon are in `assets/`. The page uses Google Fonts when online; it falls back to local system fonts offline. The “Back to Homepage” link points to [Griffin Rutherford's portfolio](https://griffinrutherford.com/).

The site can be published directly from the repository root with GitHub Pages; no build step is needed.

Run the numerical checks with `node --test tests/statistics-core.test.js`.
