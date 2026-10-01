/* Geometry is computed from coordinates; screen projections do not change topology. */
(function (root, factory) {
    const core = factory();
    if (typeof module === 'object' && module.exports) module.exports = core;
    else root.DimensionsCore = core;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    function hypercube(dimension) {
        if (!Number.isInteger(dimension) || dimension < 0 || dimension > 6) throw new RangeError('Choose 0–6 dimensions.');
        const vertices = Array.from({ length: 2 ** dimension }, (_, i) => Array.from({ length: dimension }, (_, axis) => (i >> axis) & 1 ? 1 : -1));
        const edges = [];
        vertices.forEach((_, i) => { for (let axis = 0; axis < dimension; axis++) { const j = i ^ (1 << axis); if (i < j) edges.push([i, j, axis]); } });
        return { vertices, edges };
    }
    function rotate(vector, axisA, axisB, angle) {
        const result = vector.slice(), c = Math.cos(angle), s = Math.sin(angle);
        result[axisA] = c * vector[axisA] - s * vector[axisB];
        result[axisB] = s * vector[axisA] + c * vector[axisB];
        return result;
    }
    function project4(vector, camera = 4, orthographic = false) {
        if (!orthographic && camera <= vector[3]) throw new RangeError('Camera must be beyond the projected point.');
        const factor = orthographic ? 1 : camera / (camera - vector[3]);
        return vector.slice(0, 3).map(value => value * factor);
    }
    function sliceRadius(coordinate) {
        return Math.abs(coordinate) > 1 ? null : Math.sqrt(Math.max(0, 1 - coordinate * coordinate));
    }
    function distance(a, b) {
        if (a.length !== b.length) throw new RangeError('Vectors must have matching dimensions.');
        return Math.hypot(...a.map((value, i) => value - b[i]));
    }
    function distanceBudget(values, axisX, axisY) {
        if (!Number.isInteger(axisX) || !Number.isInteger(axisY) || axisX < 0 || axisY < 0 || axisX >= values.length || axisY >= values.length) throw new RangeError('Choose valid coordinate indices.');
        const squared = values.map(v => v * v), total = squared.reduce((a,b) => a + b, 0);
        // Repeating an axis displays only one independent coordinate, not its contribution twice.
        const visible = squared[axisX] + (axisX === axisY ? 0 : squared[axisY]);
        return { squared, total, visible, hidden: Math.max(0, total - visible), loss: total / 2 };
    }
    function recipeStep(values, fraction = .25) {
        if (!Number.isFinite(fraction) || fraction < 0 || fraction > 1) throw new RangeError('Use a fraction between zero and one.');
        return values.map(v => (1 - fraction) * v);
    }
    function innerVolumeFraction(dimension, radius = .9) {
        if (!Number.isInteger(dimension) || dimension < 1 || !Number.isFinite(radius) || radius < 0 || radius > 1) throw new RangeError('Use a positive integer dimension and a radius from zero to one.');
        return radius ** dimension;
    }
    function bypass(progress) {
        const p = Math.max(0, Math.min(1, progress));
        if (p < .3) return [0, 0, p / .3 * 1.2];
        if (p < .7) return [(p - .3) / .4 * 1.8, 0, 1.2];
        return [1.8, 0, (1 - p) / .3 * 1.2];
    }
    const cubeNet = [[0,0],[-1,0],[1,0],[0,-1],[0,1],[0,2]];
    const tesseractNet = [[0,0,0],[-1,0,0],[1,0,0],[0,-1,0],[0,1,0],[0,0,-1],[0,0,1],[0,0,2]];
    return { hypercube, rotate, project4, sliceRadius, distance, distanceBudget, recipeStep, innerVolumeFraction, bypass, cubeNet, tesseractNet };
});
