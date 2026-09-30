const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../modeling-core.js');
const S = require('../statistics-core.js');
const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);

test('pilot reference and held-out context change have known solutions', () => {
    const fit = C.fit(C.PILOTS);
    near(fit.intercept, 100); near(fit.slope, -12);
    near(C.error(fit, C.PILOTS), 22 / 7);
    near(C.error(fit, C.VALIDATION.similar), 2);
    near(C.error(fit, C.VALIDATION.rainy), 787 / 3);
});

test('scaled line updates agree with numerical derivatives of half-MSE', () => {
    const center = 4.5, scale = 1.5, height = 44, tilt = -12, epsilon = 1e-5, rate = .3;
    const line = (h, t) => ({ intercept: h - t / scale * center, slope: t / scale });
    for (const indices of [[0], [1, 3, 6], [0, 1, 2, 3, 4, 5, 6]]) {
        const rows = indices.map(i => C.PILOTS[i]);
        const loss = (h, t) => C.error(line(h, t), rows) / 2;
        const dh = (loss(height + epsilon, tilt) - loss(height - epsilon, tilt)) / (2 * epsilon);
        const dt = (loss(height, tilt + epsilon) - loss(height, tilt - epsilon)) / (2 * epsilon);
        const next = C.update(line(height, tilt), C.PILOTS, indices, rate);
        near(C.predict(next, center), height - rate * dh, 1e-6);
        near(next.slope * scale, tilt - rate * dt, 1e-6);
    }
});

test('all-pilot updates converge and shuffled full batches give identical directions', () => {
    let line = { intercept: 80, slope: -8 };
    const indices = C.PILOTS.map((_, i) => i);
    const normal = C.update(line, C.PILOTS, indices, .3);
    const reversed = C.update(line, C.PILOTS, [...indices].reverse(), .3);
    near(normal.intercept, reversed.intercept); near(normal.slope, reversed.slope);
    for (let i = 0; i < 180; i++) line = C.update(line, C.PILOTS, indices, .3);
    near(line.intercept, 100); near(line.slope, -12);
});

test('seeded real-pilot updates replay exactly; small-batch loss may rise', () => {
    function run(seed) {
        const random = S.makeRandom(seed); let line = { intercept: 100, slope: -12 };
        const path = [];
        for (let i = 0; i < 20; i++) {
            const batch = S.sampleIndices(7, 3, random);
            assert.equal(new Set(batch).size, 3);
            line = C.update(line, C.PILOTS, batch, .3); path.push({ batch, line });
        }
        return path;
    }
    assert.deepEqual(run(2026), run(2026));
    assert.notDeepEqual(run(2026), run(2027));
    assert.ok(C.error(run(2026)[0].line, C.PILOTS) > 22 / 7);
});

test('capacity caps sales and changes the profit-maximizing price', () => {
    const line = { intercept: 100, slope: -12 };
    const limited = C.plan(line, 3, 1.25, 30, 40);
    near(limited.demand, 64); near(limited.sales, 40); near(limited.profit, 40); assert.ok(limited.limited);
    const best = C.bestPrice(line, 1.25, 30, 40);
    near(best.price, 5); near(best.revenue, 200); near(best.cost, 80); near(best.profit, 120);
    near(C.bestPrice(line, 1.25, 30, 80).price, 4.75);
    near(C.plan(line, 12, 1.25, 30, 40).sales, 0);
    for (let p = 3; p <= 6; p += .25) assert.ok(C.plan(line, p, 1.25, 30, 40).profit <= best.profit);
});
