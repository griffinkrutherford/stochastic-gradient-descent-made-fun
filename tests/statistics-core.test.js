const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../statistics-core');

const rows = core.STUDENTS;
const allRows = rows.map((_, index) => index);

test('the worksheet dataset and hand-calculated examples agree', () => {
    assert.equal(rows.length, 12);
    assert.equal(rows.reduce((total, row) => total + row.score, 0), 912);
    assert.equal(core.mean(rows.map(row => row.score)), 76);
    assert.equal(core.meanUpdate(60, [{ score: 80 }], [0], 0.25).estimate, 65);
    assert.equal(82 - 70, 12);
});

test('a full-batch mean step moves toward the sample mean and lowers full-data error', () => {
    const startError = core.meanSquaredError(rows, 60);
    const next = core.meanUpdate(60, rows, allRows, 0.25);
    assert.equal(next.batchMean, 76);
    assert.equal(next.estimate, 64);
    assert.ok(core.meanSquaredError(rows, next.estimate) < startError);
});

test('random batches are reproducible and contain distinct valid students', () => {
    const first = core.makeRandom(1234);
    const second = core.makeRandom(1234);
    for (let i = 0; i < 20; i++) {
        const a = core.sampleIndices(rows.length, 4, first);
        const b = core.sampleIndices(rows.length, 4, second);
        assert.deepEqual(a, b);
        assert.equal(new Set(a).size, 4);
        assert.ok(a.every(index => index >= 0 && index < rows.length));
    }
    assert.deepEqual(core.sampleIndices(rows.length, rows.length, first), allRows);
});

test('repeated full-batch line fitting approaches the least-squares reference', () => {
    const reference = core.leastSquaresLine(rows);
    const initial = { intercept: 55, slope: 2 };
    let fitted = initial;
    for (let step = 0; step < 60; step++) fitted = core.lineUpdate(fitted, rows, allRows, 0.3);
    assert.ok(Math.abs(fitted.intercept - reference.intercept) < 0.01);
    assert.ok(Math.abs(fitted.slope - reference.slope) < 0.01);
    assert.ok(core.lineMeanSquaredError(rows, fitted.intercept, fitted.slope)
        < core.lineMeanSquaredError(rows, initial.intercept, initial.slope));
});

test('a stochastic mean step can raise full-data error even at the optimum', () => {
    const optimum = core.mean(rows.map(row => row.score));
    const next = core.meanUpdate(optimum, rows, [0], 0.25);
    assert.ok(core.meanSquaredError(rows, next.estimate) > core.meanSquaredError(rows, optimum));
});

test('line updates agree with numerical gradients in centered, scaled coordinates', () => {
    const xMean = core.mean(rows.map(row => row.hours));
    const scale = 5.5;
    const center = 66;
    const tilt = 11;
    const rate = 0.3;
    const epsilon = 1e-5;
    for (const indices of [allRows, [0], [1, 4, 7, 10]]) {
        const batch = indices.map(index => rows[index]);
        const objective = (height, angle) => core.lineMeanSquaredError(
            batch, height - angle / scale * xMean, angle / scale) / 2;
        const heightGradient = (objective(center + epsilon, tilt) - objective(center - epsilon, tilt)) / (2 * epsilon);
        const tiltGradient = (objective(center, tilt + epsilon) - objective(center, tilt - epsilon)) / (2 * epsilon);
        const next = core.lineUpdate({ intercept: center - tilt / scale * xMean, slope: tilt / scale }, rows, indices, rate);
        assert.ok(Math.abs(next.intercept + next.slope * xMean - (center - rate * heightGradient)) < 1e-7);
        assert.ok(Math.abs(next.slope * scale - (tilt - rate * tiltGradient)) < 1e-7);
    }
});
