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
    function bypass(progress) {
        const p = Math.max(0, Math.min(1, progress));
        if (p < .3) return [0, 0, p / .3 * 1.2];
        if (p < .7) return [(p - .3) / .4 * 1.8, 0, 1.2];
        return [1.8, 0, (1 - p) / .3 * 1.2];
    }
    const cubeNet = [[0,0],[-1,0],[1,0],[0,-1],[0,1],[0,2]];
    const tesseractNet = [[0,0,0],[-1,0,0],[1,0,0],[0,-1,0],[0,1,0],[0,0,-1],[0,0,1],[0,0,2]];
    return { hypercube, rotate, project4, sliceRadius, distance, bypass, cubeNet, tesseractNet };
});
