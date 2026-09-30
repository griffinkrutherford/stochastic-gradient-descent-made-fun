/* Real pilot-based fitting and a separate capacity-constrained decision model. */
(function () {
    'use strict';
    const C = window.ModelingCore;
    const get = id => document.getElementById(`model-${id}`);
    const panel = document.getElementById('modeling-worksheet');
    const reference = C.fit(C.PILOTS);
    const format = (value, digits = 2) => Number(value).toFixed(digits);
    const money = value => `$${format(value)}`;
    let line = { intercept: 80, slope: -8 };
    let selected = [], steps = 0, processed = 0, seed = 2026;
    let random = window.StatsCore.makeRandom(seed);
    let history = [{ step: 0, ...line, error: C.error(line, C.PILOTS) }];
    let timer = null, remaining = 0, showReference = false, validationVisible = false;

    get('pilots').querySelector('tbody').innerHTML = C.PILOTS.map((row, i) =>
        `<tr data-model-row="${i}"><th scope="row">${i + 1}</th><td>${money(row.price)}</td><td>${row.cups}</td><td>No</td></tr>`).join('');

    function pause() {
        if (timer !== null) clearInterval(timer);
        timer = null;
        get('run').textContent = 'Run 30 steps';
    }
    window.pauseModelingWorksheet = pause;
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

    function reset() {
        pause();
        line = { intercept: 80, slope: -8 };
        selected = []; steps = 0; processed = 0;
        random = window.StatsCore.makeRandom(seed);
        history = [{ step: 0, ...line, error: C.error(line, C.PILOTS) }];
        get('step-summary').textContent = `Starting line: q = 80 − 8p. Sequence ${seed}. Choose pilots per step, predict what happens, then take a step.`;
        render();
    }

    function step() {
        const batch = Number(get('batch').value), rate = Number(get('rate').value);
        selected = window.StatsCore.sampleIndices(C.PILOTS.length, batch, random);
        const before = line;
        const next = C.update(line, C.PILOTS, selected, rate);
        if (!Number.isFinite(C.error(next, C.PILOTS)) || Math.max(Math.abs(next.intercept), Math.abs(next.slope)) > 10000) {
            pause();
            get('step-summary').textContent = 'This setting is sending the line far from the pilots. Reset, choose a smaller step fraction, and try again.';
            return;
        }
        line = next; steps++; processed += batch;
        history.push({ step: steps, ...line, error: C.error(line, C.PILOTS) });
        get('step-summary').textContent = `Update ${steps} · pilots ${selected.map(i => i + 1).join(', ')} · a: ${format(before.intercept)} → ${format(line.intercept)} (${format(line.intercept - before.intercept)}); b: ${format(before.slope)} → ${format(line.slope)} (${format(line.slope - before.slope)}). Step fraction ${format(rate * 100, 0)}%. ${rate > 1 ? 'A step larger than 100% can overshoot; watch the full-data error.' : 'Both coefficients come from these pilots’ prediction errors.'}`;
        render();
    }

    // All charts use data-derived paths, with axes and a nearby text summary.
    function chart(id, xMin, xMax, yMin, yMax, xLabel, yLabel) {
        const canvas = get(id), ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        if (yMax <= yMin) yMax = yMin + 1;
        const box = { left: 78, right: W - 26, top: 40, bottom: H - 55 };
        const x = value => box.left + (value - xMin) / (xMax - xMin) * (box.right - box.left);
        const y = value => box.bottom - (value - yMin) / (yMax - yMin) * (box.bottom - box.top);
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#07121f'; ctx.fillRect(0, 0, W, H);
        const fontSize = Math.max(16, Math.min(28, 16 * W / (canvas.clientWidth || W)));
        ctx.font = `${fontSize}px Arial`; ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const v = yMin + (yMax - yMin) * i / 4;
            ctx.strokeStyle = '#294254'; ctx.beginPath(); ctx.moveTo(box.left, y(v)); ctx.lineTo(box.right, y(v)); ctx.stroke();
            ctx.fillStyle = '#c6deef'; ctx.textAlign = 'right'; ctx.fillText(format(v, Math.abs(yMax) > 100 ? 0 : 1), box.left - 8, y(v) + 5);
            const h = xMin + (xMax - xMin) * i / 4;
            ctx.textAlign = 'center'; ctx.fillText(format(h, xLabel.includes('Price') ? 2 : 0), x(h), box.bottom + 22);
        }
        ctx.strokeStyle = '#9ac2dc'; ctx.beginPath(); ctx.moveTo(box.left, box.top); ctx.lineTo(box.left, box.bottom); ctx.lineTo(box.right, box.bottom); ctx.stroke();
        ctx.fillStyle = '#e5edf7'; ctx.textAlign = 'left'; ctx.fillText(yLabel, box.left, 24);
        ctx.textAlign = 'center'; ctx.fillText(xLabel, (box.left + box.right) / 2, H - 12);
        return { ctx, x, y, box };
    }
    function path(plot, points, color, dashed = false) {
        const { ctx, x, y, box } = plot;
        ctx.save(); ctx.beginPath(); ctx.rect(box.left, box.top, box.right - box.left, box.bottom - box.top); ctx.clip();
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.setLineDash(dashed ? [8, 6] : []); ctx.beginPath();
        points.forEach(([a, b], i) => i ? ctx.lineTo(x(a), y(b)) : ctx.moveTo(x(a), y(b)));
        ctx.stroke(); ctx.restore();
    }
    function point(plot, a, b, color, radius = 6) {
        plot.ctx.beginPath(); plot.ctx.arc(plot.x(a), plot.y(b), radius, 0, Math.PI * 2); plot.ctx.fillStyle = color; plot.ctx.fill();
    }

    function renderFit() {
        for (const [id, min, max] of [['intercept', 30, 150], ['slope', -25, 0]]) {
            get(id).min = Math.floor(Math.min(min, line[id]));
            get(id).max = Math.ceil(Math.max(max, line[id]));
            get(id).value = line[id];
        }
        get('intercept-value').textContent = format(line.intercept);
        get('slope-value').textContent = format(line.slope);
        panel.querySelectorAll('[data-model-row]').forEach(row => {
            const active = selected.includes(Number(row.dataset.modelRow));
            row.classList.toggle('model-selected', active);
            row.lastElementChild.textContent = active ? 'Selected' : 'No';
        });
        const predictions = [C.predict(line, 3), C.predict(line, 6)];
        const plot = chart('fit-chart', 3, 6, Math.min(0, ...predictions), Math.max(80, ...predictions), 'Price ($/cup)', 'Demand (cups/hour)');
        if (showReference) path(plot, [[3, C.predict(reference, 3)], [6, C.predict(reference, 6)]], '#ffd166', true);
        C.PILOTS.forEach((row, i) => {
            path(plot, [[row.price, row.cups], [row.price, C.predict(line, row.price)]], '#426079');
            point(plot, row.price, row.cups, selected.includes(i) ? '#ffd166' : '#e5edf7', selected.includes(i) ? 8 : 5);
        });
        path(plot, [[3, predictions[0]], [6, predictions[1]]], '#61c7ff');
        const errors = chart('error-chart', 0, Math.max(10, steps), 0, Math.max(12, ...history.map(v => v.error)) * 1.08, 'Updates', 'Average squared error ((cups/hour)²)');
        path(errors, history.map(v => [v.step, v.error]), '#61c7ff');
        path(errors, [[0, C.error(reference, C.PILOTS)], [Math.max(10, steps), C.error(reference, C.PILOTS)]], '#ffd166', true);
        point(errors, steps, history[history.length - 1].error, '#61c7ff');
        get('fit-summary').textContent = `Current model: q = ${format(line.intercept)} ${line.slope < 0 ? '−' : '+'} ${format(Math.abs(line.slope))}p. Full-data average squared error: ${format(C.error(line, C.PILOTS))} (cups/hour)². ${steps} updates; ${processed} pilot observations processed. Cyan: current fit/error. Yellow dashed: ${showReference ? 'reference line and ' : ''}minimum reference error ${format(C.error(reference, C.PILOTS))}. ${showReference ? 'Reference q = 100 − 12p.' : ''}`;
    }

    function renderPlan() {
        const price = Number(get('price').value), capacity = Number(get('capacity').value);
        const variable = Number(get('variable-cost').value), fixed = Number(get('fixed-cost').value);
        get('price-value').textContent = money(price); get('capacity-value').textContent = capacity;
        get('variable-cost-value').textContent = money(variable); get('fixed-cost-value').textContent = money(fixed);
        const plan = C.plan(line, price, variable, fixed, capacity);
        const best = C.bestPrice(line, variable, fixed, capacity);
        get('budget').innerHTML = `<div><span>Revenue / hour</span><strong>${money(plan.revenue)}</strong></div><div><span>Cost / hour</span><strong>${money(plan.cost)}</strong></div><div><span>Profit / hour</span><strong>${money(plan.profit)}</strong></div>`;
        const points = Array.from({ length: 121 }, (_, i) => { const p = 3 + i / 40; return [p, C.plan(line, p, variable, fixed, capacity).profit]; });
        const profits = points.map(p => p[1]);
        const plot = chart('profit-chart', 3, 6, Math.min(0, ...profits) - 10, Math.max(10, ...profits) + 15, 'Price ($/cup)', 'Expected profit ($/hour)');
        path(plot, points, '#61c7ff'); point(plot, best.price, best.profit, '#ffd166', 8); point(plot, price, plan.profit, '#fff', 5);
        get('plan-summary').textContent = `At ${money(price)}/cup: expected demand ${format(plan.demand, 1)} cups/hour; sales ${format(plan.sales, 1)} cups/hour. ${plan.limited ? 'Capacity limits sales; the remaining demand is unmet.' : 'Demand fits within service capacity.'} Best on the 25¢ grid from $3 to $6: ${money(best.price)} with ${money(best.profit)}/hour predicted profit (yellow). White: your price. Uses the current Q4 fit; goals beyond profit may change your choice.`;
    }

    function renderValidation() {
        if (!validationVisible) return;
        const day = get('validation-day').value, rows = C.VALIDATION[day];
        get('validation-table').querySelector('tbody').innerHTML = rows.map(row => `<tr><td>${money(row.price)}</td><td>${row.cups}</td><td>${format(C.predict(line, row.price), 1)}</td><td>${format(row.cups - C.predict(line, row.price), 1)}</td></tr>`).join('');
        get('validation-summary').textContent = `${day === 'rainy' ? 'Rainy-day turnout' : 'Similar school day'}: current fit average squared error ${format(C.error(line, rows))} (cups/hour)². Reference fit: ${format(C.error(reference, rows))}. These rows never enter a fitting update. ${day === 'rainy' ? 'The context changed. Re-running the old pilots does not add weather or attendance to the model.' : 'Compare new-day error with pilot error before trusting the model.'}`;
    }
    function render() { renderFit(); renderPlan(); renderValidation(); }
    window.getModelingLine = () => ({ ...line, steps, path: history.map(({ intercept, slope }) => ({ intercept, slope })) });
    window.renderModelingWorksheet = render;
    window.addEventListener('resize', () => { if (!panel.hidden) render(); });

    get('step').addEventListener('click', () => { pause(); step(); });
    get('run').addEventListener('click', () => {
        if (timer !== null) { pause(); return; }
        remaining = 30; get('run').textContent = 'Pause fitting';
        timer = setInterval(() => {
            if (panel.hidden) { pause(); return; }
            step(); remaining--; if (remaining <= 0) pause();
        }, 250);
    });
    get('reset').addEventListener('click', reset);
    get('sequence').addEventListener('click', () => { seed++; reset(); });
    ['batch', 'rate'].forEach(id => get(id).addEventListener('change', pause));
    ['intercept', 'slope'].forEach(id => get(id).addEventListener('input', () => {
        pause(); line = { ...line, [id]: Number(get(id).value) };
        selected = []; steps = 0; processed = 0; history = [{ step: 0, ...line, error: C.error(line, C.PILOTS) }];
        get('step-summary').textContent = 'Line adjusted by hand. Start a new fitting path from this candidate.'; render();
    }));
    get('reference').addEventListener('click', () => {
        showReference = !showReference; get('reference').setAttribute('aria-pressed', String(showReference));
        get('reference').textContent = showReference ? 'Hide best-fit reference' : 'Show best-fit reference'; renderFit();
    });
    get('use-reference').addEventListener('click', () => {
        pause(); line = { ...reference }; selected = []; steps = 0; processed = 0;
        history = [{ step: 0, ...line, error: C.error(line, C.PILOTS) }];
        get('step-summary').textContent = 'Loaded the directly calculated best-fit line q = 100 − 12p. Planner and validation now use this line.'; render();
    });
    ['price', 'capacity', 'variable-cost', 'fixed-cost'].forEach(id => get(id).addEventListener('input', renderPlan));
    get('validate').addEventListener('click', () => { validationVisible = true; get('validation-results').hidden = false; renderValidation(); });
    get('validation-day').addEventListener('change', renderValidation);
    get('print').addEventListener('click', () => window.print());

    const answers = {
        slope: { value: -12, tolerance: .01, explanation: '(28 − 64)/(6 − 3) = −12 cups/hour per $1 increase.' },
        residual: { value: 2, tolerance: .01, explanation: '48 − 46 = +2 cups/hour; the model underpredicted.' },
        profit: { value: 120, tolerance: .01, explanation: '5 × 40 − (30 + 1.25 × 40) = $120.' },
        growth: { value: 58.59375, tolerance: .1, explanation: '30 × 1.25³ = 58.59375, or 58.6 predicted views.' },
        angle: { value: 53.130102, tolerance: .1, explanation: 'tan⁻¹(2.4/1.8) ≈ 53.1°; use degree mode.' }
    };
    panel.querySelectorAll('[data-model-check]').forEach(button => {
        const key = button.dataset.modelCheck;
        function check() {
            const input = get(`answer-${key}`), feedback = get(`feedback-${key}`), answer = answers[key];
            const value = Number(input.value);
            if (input.value.trim() === '' || !Number.isFinite(value)) {
                feedback.textContent = 'Enter a number first. You can use a calculator.'; feedback.dataset.result = 'empty'; return;
            }
            const correct = Math.abs(value - answer.value) <= answer.tolerance + 1e-9;
            feedback.dataset.result = correct ? 'correct' : 'incorrect';
            feedback.textContent = `${correct ? 'Correct within' : 'Try again; the answer is checked within'} ±${answer.tolerance}. ${answer.explanation}`;
        }
        button.addEventListener('click', check);
        get(`answer-${key}`).addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); check(); } });
    });
    const writing = {
        frame: [
            { pattern: /price|charge|dollar|\$|cost per cup/i, hint: 'Name the price decision.' },
            { pattern: /profit|earn|revenue|waste|afford|access|queue|wait|welcom/i, hint: 'State a measurable goal or an access/waste goal.' },
            { pattern: /assum|weather|rain|crowd|attend|cup size|similar|staff|time/i, hint: 'Name a condition you would need to check.' }
        ],
        pitch: [
            { pattern: /\$|dollar|price|charge/i, hint: 'Give a proposed price with units.' },
            { pattern: /profit|earn/i, hint: 'Include expected profit and the one-hour duration.' },
            { pattern: /capacity|40|cups|hour/i, hint: 'Explain the serving limit and rate units.' },
            { pattern: /assum|trade|afford|waste|access|weather|rain|staff|check|collect|attend/i, hint: 'Add a tradeoff or assumption and a next check.' }
        ],
        ai: [
            { pattern: /error|predict|adjust|update|learn|fit/i, hint: 'Connect prediction errors to updates during fitting.' },
            { pattern: /price|cost|capacity|goal|decid|decision/i, hint: 'Explain the goal and constraints of the price decision.' },
            { pattern: /temperature|probabil|output|next word/i, hint: 'Explain what output temperature changes after training.' }
        ]
    };
    panel.querySelectorAll('[data-model-writing]').forEach(button => {
        const key = button.dataset.modelWriting;
        function check() {
            const response = get(`response-${key}`).value.trim(), feedback = get(`feedback-${key}`);
            if (!response) { feedback.textContent = 'Write your explanation first, then ask for feedback.'; return; }
            const missing = writing[key].filter(item => !item.pattern.test(response));
            feedback.textContent = `${missing.length ? `Consider adding: ${missing.map(item => item.hint).join(' ')}` : 'Your response mentions the main ideas. Check that your numbers, units, and reasoning support your recommendation.'} This checks for relevant terms; it does not grade your reasoning. Compare with the explanation and discuss with your partner.`;
        }
        button.addEventListener('click', check);
        get(`response-${key}`).addEventListener('keydown', event => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); check(); } });
    });

    const storageKey = 'sgd-modeling-prep-popup-v1';
    const fields = [...panel.querySelectorAll('[data-model-draft]')];
    try {
        const drafts = JSON.parse(localStorage.getItem(storageKey) || '{}');
        fields.forEach(field => { if (typeof drafts[field.id] === 'string') field.value = drafts[field.id]; });
    } catch (_) { get('save-status').textContent = 'Browser storage is unavailable. Keep this tab open or copy your responses.'; }
    fields.forEach(field => field.addEventListener('input', () => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(fields.map(input => [input.id, input.value]))));
            get('save-status').textContent = 'Responses saved in this browser. Enter checks a number; Ctrl/Cmd+Enter requests written feedback.';
        } catch (_) { get('save-status').textContent = 'Browser storage is unavailable. Copy your responses before closing the tab.'; }
    }));
    reset();
})();
