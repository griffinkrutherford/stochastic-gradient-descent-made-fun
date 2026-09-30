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
        return { element, home, statisticsSlot: get(slot), modelingSlot: get(slot.replace('stats-', 'model-')) };
    });

    const captions = [
        ['#shared-marble-bowl > h3', 'The Marble Bowl: prediction error'],
        ['#shared-marble-bowl > p:first-of-type', 'Each marble pictures a candidate model. Lower places picture smaller prediction errors. Green marks the global minimum; gold marks local traps. Drag to orbit.'],
        ['#shared-marble-bowl > p:nth-of-type(2)', 'Shaking illustrates wandering and settling. Actual SGD uses randomly selected player rows. Question 5 calculates those updates.'],
        ['label[for="sgdNoise"]', 'Shaking in the bowl illustration'],
        ['#shared-training > .wordvec-title', 'Learning from examples: two visual stories'],
        ['#shared-training > .wordvec-note', 'Words becoming organized and a bowl taking shape are two ways to picture learning patterns. Connect them to our line improving its predictions step by step.'],
        ['#shared-output > .wordvec-note', 'The trained model offers possible next words with different probabilities. Watch the choices and probability bars as you change temperature. This is output generation after learning.']
    ].map(([selector, text]) => {
        const element = document.querySelector(selector);
        return { element, original: element.innerHTML, statistics: text };
    });

    const descriptions = {
        sgdCanvas: 'Illustrated bowl with local dents, a deepest point, and moving candidate-model marbles. Arrow keys rotate, Home restores the view, and the controls and counters describe the current state.',
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

    const modelingCaptions = [
        'Byte’s model bowl',
        'Picture café model candidates as marbles, and prediction error as height. Drag to orbit. The dents illustrate complex models; our actual café line fit has a single least-squares optimum.',
        'Shaking is a physical illustration. Actual café updates use randomly selected pilot windows. See Question 4 for computed steps.',
        'Shaking in the bowl illustration',
        'Learning patterns: from café pilots to language examples',
        'These moving words and the shaping bowl illustrate learning. Connect them to Byte improving a demand line using its prediction errors.',
        'After learning, the model assigns probabilities to possible next words. Temperature changes the output distribution; it does not refit the demand line or train the language model again.'
    ];
    window.syncWorksheetAnimations = mode => {
        for (const { element, home, statisticsSlot, modelingSlot } of widgets) {
            if (mode === 'modeling') modelingSlot.appendChild(element);
            else if (mode === 'statistics') statisticsSlot.appendChild(element);
            else home.after(element);
        }
        for (const [index, { element, original, statistics }] of captions.entries()) {
            if (mode === 'modeling') element.textContent = modelingCaptions[index];
            else if (mode === 'statistics') element.textContent = statistics;
            else element.innerHTML = original;
        }
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = reducedMotion.matches;
    window.areWorksheetAnimationsPaused = () => paused || document.hidden;
    const button = get('shared-animations-toggle');
    function renderMotionControl() {
        button.textContent = paused ? 'Play all visual animations' : 'Pause all visual animations';
        button.setAttribute('aria-pressed', String(paused));
        get('shared-animation-state').textContent = paused
            ? 'Animations paused. The sliders and drag controls still work.'
            : 'Animations playing. Drag the 3D scenes to change your view, or pause to discuss a frame.';
    }
    button.addEventListener('click', () => { paused = !paused; renderMotionControl(); });
    reducedMotion.addEventListener('change', event => { paused = event.matches; renderMotionControl(); });
    renderMotionControl();
})();
