/* Fictional café pilots. Prices are dollars/cup; demand and capacity are cups/hour. */
(function (root) {
    'use strict';
    const PILOTS = Object.freeze([
        { price: 3, cups: 66 }, { price: 3.5, cups: 56 }, { price: 4, cups: 51 },
        { price: 4.5, cups: 48 }, { price: 5, cups: 39 }, { price: 5.5, cups: 32 },
        { price: 6, cups: 30 }
    ]);
    const VALIDATION = Object.freeze({
        similar: [{ price: 3.75, cups: 54 }, { price: 4.75, cups: 44 }, { price: 5.75, cups: 33 }],
        rainy: [{ price: 3.75, cups: 34 }, { price: 4.75, cups: 28 }, { price: 5.75, cups: 20 }]
    });
    const average = values => values.reduce((sum, value) => sum + value, 0) / values.length;
    const predict = (line, price) => line.intercept + line.slope * price;
    const error = (line, rows) => average(rows.map(row => (predict(line, row.price) - row.cups) ** 2));

    function fit(rows) {
        const center = average(rows.map(row => row.price));
        const meanDemand = average(rows.map(row => row.cups));
        const spread = rows.reduce((sum, row) => sum + (row.price - center) ** 2, 0);
        if (!spread) throw new Error('Use at least two different prices to fit demand.');
        const slope = rows.reduce((sum, row) => sum + (row.price - center) * (row.cups - meanDemand), 0) / spread;
        return { intercept: meanDemand - slope * center, slope };
    }

    // Update height and tilt in centered, scaled price coordinates; return dollars/cup units.
    function update(line, rows, indices, rate) {
        const centerPrice = average(rows.map(row => row.price));
        const scale = Math.max(1, (Math.max(...rows.map(row => row.price)) - Math.min(...rows.map(row => row.price))) / 2);
        const center = predict(line, centerPrice);
        const tilt = line.slope * scale;
        const selected = indices.map(index => rows[index]);
        const heightError = average(selected.map(row => predict(line, row.price) - row.cups));
        const tiltError = average(selected.map(row => (predict(line, row.price) - row.cups) * (row.price - centerPrice) / scale));
        const nextTilt = tilt - rate * tiltError;
        return { intercept: center - rate * heightError - nextTilt / scale * centerPrice, slope: nextTilt / scale };
    }

    function plan(line, price, costPerCup, fixedCost, capacity) {
        const demand = Math.max(0, predict(line, price));
        const sales = Math.min(demand, capacity);
        const revenue = price * sales;
        const cost = fixedCost + costPerCup * sales;
        return { demand, sales, revenue, cost, profit: revenue - cost, limited: demand > capacity };
    }

    function bestPrice(line, costPerCup, fixedCost, capacity) {
        let best = null;
        for (let cents = 300; cents <= 600; cents += 25) {
            const price = cents / 100;
            const prediction = plan(line, price, costPerCup, fixedCost, capacity);
            if (!best || prediction.profit > best.profit + 1e-8) best = { price, ...prediction };
        }
        return best;
    }

    const api = { PILOTS, VALIDATION, predict, error, fit, update, plan, bestPrice };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    root.ModelingCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
