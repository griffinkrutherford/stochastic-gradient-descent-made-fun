/* Small, dependency-free calculations shared by the statistics worksheet and its checks. */
(function (root) {
    'use strict';

    const PLAYERS = Object.freeze([
        { name: "Astro", practiceRounds: 0, score: 62 }, { name: "Bloop", practiceRounds: 1, score: 68 },
        { name: "Comet", practiceRounds: 2, score: 60 }, { name: "Doodle", practiceRounds: 3, score: 72 },
        { name: "Echo", practiceRounds: 4, score: 70 }, { name: "Fizz", practiceRounds: 5, score: 78 },
        { name: "Gizmo", practiceRounds: 6, score: 74 }, { name: "Hex", practiceRounds: 7, score: 84 },
        { name: "Iggy", practiceRounds: 8, score: 82 }, { name: "Jinx", practiceRounds: 9, score: 80 },
        { name: "Koko", practiceRounds: 10, score: 90 }, { name: "Luma", practiceRounds: 11, score: 92 }
    ]);

    function mean(values) {
        if (!values.length) throw new Error('An average needs at least one value.');
        return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    function meanSquaredError(rows, estimate) {
        return mean(rows.map(row => (row.score - estimate) ** 2));
    }

    function makeRandom(seed) {
        let state = seed >>> 0;
        return function () {
            state += 0x6D2B79F5;
            let value = state;
            value = Math.imul(value ^ (value >>> 15), value | 1);
            value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        };
    }

    // Each call selects an independent uniform subset; no row repeats within a batch.
    function sampleIndices(count, batchSize, random) {
        if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > count) {
            throw new Error('Batch size must be between 1 and the number of rows.');
        }
        const indices = Array.from({ length: count }, (_, index) => index);
        for (let i = 0; i < batchSize; i++) {
            const pick = i + Math.floor(random() * (count - i));
            [indices[i], indices[pick]] = [indices[pick], indices[i]];
        }
        return indices.slice(0, batchSize).sort((a, b) => a - b);
    }

    function meanUpdate(estimate, rows, indices, rate) {
        const batchMean = mean(indices.map(index => rows[index].score));
        return { estimate: estimate + rate * (batchMean - estimate), batchMean };
    }

    function lineMeanSquaredError(rows, intercept, slope) {
        return mean(rows.map(row => (row.score - intercept - slope * row.practiceRounds) ** 2));
    }

    function leastSquaresLine(rows) {
        const xMean = mean(rows.map(row => row.practiceRounds));
        const yMean = mean(rows.map(row => row.score));
        const spread = rows.reduce((sum, row) => sum + (row.practiceRounds - xMean) ** 2, 0);
        if (spread === 0) throw new Error('A line needs at least two different practice-round values.');
        const slope = rows.reduce((sum, row) => sum + (row.practiceRounds - xMean) * (row.score - yMean), 0) / spread;
        return { intercept: yMean - slope * xMean, slope };
    }

    // Center and scale practiceRounds internally so one step size works for height and tilt.
    function lineUpdate(line, rows, indices, rate) {
        const xMean = mean(rows.map(row => row.practiceRounds));
        const scale = Math.max(1, (Math.max(...rows.map(row => row.practiceRounds)) - Math.min(...rows.map(row => row.practiceRounds))) / 2);
        let center = line.intercept + line.slope * xMean;
        let tilt = line.slope * scale;
        let heightError = 0;
        let tiltError = 0;
        for (const index of indices) {
            const row = rows[index];
            const centeredRounds = (row.practiceRounds - xMean) / scale;
            const error = center + tilt * centeredRounds - row.score;
            heightError += error;
            tiltError += error * centeredRounds;
        }
        center -= rate * heightError / indices.length;
        tilt -= rate * tiltError / indices.length;
        return { intercept: center - (tilt / scale) * xMean, slope: tilt / scale };
    }

    const api = { PLAYERS, mean, meanSquaredError, makeRandom, sampleIndices, meanUpdate,
        lineMeanSquaredError, leastSquaresLine, lineUpdate };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.StatsCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
