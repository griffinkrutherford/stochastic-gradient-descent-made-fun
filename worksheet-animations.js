/* Reuse the same live canvases in each lesson without duplicating their state or controls. */
(function () {
    'use strict';

    const get = id => document.getElementById(id);
    const widgets = [
        ['shared-marble-bowl', 'stats-marble-bowl-slot'],
        ['shared-word-vectors', 'stats-word-vectors-slot'],
        ['shared-training', 'stats-training-slot'],
        ['shared-output', 'stats-output-slot']
    ].map(([id, slot]) => {
        const element = get(id);
        const home = document.createComment(`${id} original position`);
        element.before(home);
        return { element, home, slot: get(slot) };
    });

    const captions = [
        ['#shared-marble-bowl > h3', 'The Marble Bowl: a picture of prediction error'],
        ['#shared-marble-bowl > p:first-of-type', 'Imagine each marble is a candidate model. Lower places in the bowl represent smaller prediction errors. This illustration includes local dents and a deepest point, called the global minimum. Drag the bowl to explore it.'],
        ['#shared-marble-bowl > p:nth-of-type(2)', 'Try the shaking slider to explore wandering and settling. Connect that motion to our randomly selected groups of scores: different groups suggest different steps. The real data-based updates are in Question 5.'],
        ['label[for="sgdNoise"]', 'Shaking in the bowl illustration'],
        ['#shared-training > .wordvec-title', 'Learning from examples: two visual stories'],
        ['#shared-training > .wordvec-note', 'Words becoming organized and a bowl taking shape are two ways to picture learning patterns. Connect them to our line improving its predictions step by step.'],
        ['#shared-output > .wordvec-note', 'The trained model offers possible next words with different probabilities. Watch the choices and probability bars as you change temperature. This is output generation after learning.']
    ].map(([selector, text]) => {
        const element = document.querySelector(selector);
        return { element, original: element.innerHTML, statistics: text };
    });

    const descriptions = {
        sgdCanvas: 'Illustrated bowl with local dents, a deepest point, and moving candidate-model marbles. The controls and counters describe the current state.',
        wordVectorCanvas: 'Illustrative word-feature map. The selected lens, scanner value, and legend describe the visible words.',
        wordConvergenceCanvas: 'Illustration of words moving into organized positions during learning.',
        bowlMorphCanvas: 'Illustration of a bowl taking shape as a model learns patterns.',
        outputWordCanvas: 'Toy language-model example showing a sequence of chosen words.',
        outputBowlCanvas: 'Marbles in a trained bowl illustrating variety in output choices.',
        outputDistributionCanvas: 'Bar chart of next-word probabilities in the toy example, controlled by temperature.'
    };
    for (const [id, description] of Object.entries(descriptions)) {
        get(id).setAttribute('role', 'img');
        get(id).setAttribute('aria-label', description);
    }

    window.syncWorksheetAnimations = isStatistics => {
        for (const { element, home, slot } of widgets) {
            if (isStatistics) slot.appendChild(element);
            else home.after(element);
        }
        for (const { element, original, statistics } of captions) {
            if (isStatistics) element.textContent = statistics;
            else element.innerHTML = original;
        }
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = reducedMotion.matches;
    window.areWorksheetAnimationsPaused = () => paused || document.hidden;
    const button = get('shared-animations-toggle');
    function renderMotionControl() {
        button.textContent = paused ? 'Play bowl and word animations' : 'Pause bowl and word animations';
        button.setAttribute('aria-pressed', String(paused));
        get('shared-animation-state').textContent = paused
            ? 'Animations paused. The sliders and drag controls still work.'
            : 'Animations playing. Drag the bowls to change your view, or pause to discuss a frame.';
    }
    button.addEventListener('click', () => { paused = !paused; renderMotionControl(); });
    reducedMotion.addEventListener('change', event => { paused = event.matches; renderMotionControl(); });
    renderMotionControl();
})();
