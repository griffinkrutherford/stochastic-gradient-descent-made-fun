(function () {
    'use strict';

    const section = document.getElementById('statistics-worksheet');
    if (!section || !window.StatsCore) return;

    const core = window.StatsCore;
    const rows = core.STUDENTS;
    const scores = rows.map(row => row.score);
    const sampleMean = core.mean(scores);
    const bestLine = core.leastSquaresLine(rows);
    const get = id => document.getElementById(id);
    const format = (value, digits = 1) => Number(value).toFixed(digits).replace(/\.0$/, '');
    const studentName = index => String.fromCharCode(65 + index);

    const meanState = {
        estimate: 60,
        steps: 0,
        seen: 0,
        sequence: 1,
        random: core.makeRandom(2026),
        history: [60],
        selected: [],
        selectedMean: null,
        previousEstimate: null,
        lastRate: null,
        timer: null
    };

    const lineState = {
        intercept: 55,
        slope: 2,
        steps: 0,
        random: core.makeRandom(2048),
        selected: [],
        showReference: false,
        timer: null
    };

    function writeText(id, text) {
        get(id).textContent = text;
    }

    function styleChart(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#09120c';
        ctx.fillRect(0, 0, width, height);
        ctx.lineWidth = 1;
        ctx.font = '15px STIX Two Text, Georgia, serif';
        ctx.textBaseline = 'middle';
    }

    function drawDotPlot() {
        const canvas = get('stats-dot-plot');
        const ctx = canvas.getContext('2d');
        styleChart(ctx, canvas.width, canvas.height);
        const left = 55, right = canvas.width - 35, baseline = 125;
        const x = score => left + (score - 55) / 40 * (right - left);
        ctx.strokeStyle = '#a6c8b0';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(left, baseline); ctx.lineTo(right, baseline); ctx.stroke();
        for (const tick of [60, 70, 80, 90]) {
            ctx.fillStyle = '#d7eadc';
            ctx.textAlign = 'center';
            ctx.fillText(String(tick), x(tick), baseline + 28);
        }
        for (const score of scores) {
            ctx.fillStyle = '#64f4ac';
            ctx.beginPath(); ctx.arc(x(score), baseline - 16, 7, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#d7eadc';
        ctx.fillText('Quiz score (points)', canvas.width / 2, canvas.height - 18);
    }

    function drawMeanLoss() {
        const canvas = get('stats-loss-chart');
        const ctx = canvas.getContext('2d');
        styleChart(ctx, canvas.width, canvas.height);
        const left = 65, right = canvas.width - 35, top = 35, bottom = canvas.height - 55;
        const low = 45, high = 105;
        const maxLoss = Math.ceil(Math.max(core.meanSquaredError(rows, low), core.meanSquaredError(rows, high)) / 100) * 100;
        const x = estimate => left + (estimate - low) / (high - low) * (right - left);
        const y = loss => bottom - loss / maxLoss * (bottom - top);
        ctx.strokeStyle = '#42634c';
        ctx.fillStyle = '#d7eadc';
        ctx.textAlign = 'center';
        for (const tick of [50, 60, 70, 80, 90, 100]) {
            const px = x(tick);
            ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bottom); ctx.stroke();
            ctx.fillText(String(tick), px, bottom + 23);
        }
        ctx.textAlign = 'right';
        for (let tick = 0; tick <= maxLoss; tick += 200) {
            const py = y(tick);
            ctx.beginPath(); ctx.moveTo(left, py); ctx.lineTo(right, py); ctx.stroke();
            ctx.fillText(String(tick), left - 9, py);
        }
        ctx.strokeStyle = '#64f4ac';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let value = low; value <= high; value += 0.5) {
            const px = x(value), py = y(core.meanSquaredError(rows, value));
            if (value === low) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 5]);
        ctx.beginPath(); ctx.moveTo(x(sampleMean), top); ctx.lineTo(x(sampleMean), bottom); ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#49a7ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        meanState.history.forEach((estimate, index) => {
            const px = x(estimate), py = y(core.meanSquaredError(rows, estimate));
            if (index === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        });
        ctx.stroke();
        const px = x(meanState.estimate), py = y(core.meanSquaredError(rows, meanState.estimate));
        ctx.fillStyle = '#ff6c69';
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#d7eadc';
        ctx.textAlign = 'center';
        ctx.fillText('Candidate average score', canvas.width / 2, canvas.height - 16);
        ctx.textAlign = 'left';
        ctx.fillText('Average squared error', left, 16);
        ctx.fillStyle = '#ffd166';
        ctx.fillText('Dashed: sample mean', right - 165, 16);
    }

    function renderMean() {
        section.querySelectorAll('[data-stats-row]').forEach(row => {
            row.classList.toggle('stats-selected', meanState.selected.includes(Number(row.dataset.statsRow)));
        });
        const error = core.meanSquaredError(rows, meanState.estimate);
        writeText('stats-mean-summary', `Current estimate: ${format(meanState.estimate, 2)} points · Full-sample mean: ${format(sampleMean)} · Average squared error: ${format(error, 1)} · Steps: ${meanState.steps} · Scores inspected: ${meanState.seen}.`);
        if (meanState.selected.length) {
            const selectedNames = meanState.selected.map(studentName).join(', ');
            writeText('stats-selected', `Selected students: ${selectedNames}. Their average: ${format(meanState.selectedMean, 2)}. Update: ${format(meanState.previousEstimate, 2)} + ${format(meanState.lastRate, 2)} × (${format(meanState.selectedMean, 2)} − ${format(meanState.previousEstimate, 2)}) = ${format(meanState.estimate, 2)}.`);
        } else {
            writeText('stats-selected', `Random sequence ${meanState.sequence}. Take a step to see which students were selected.`);
        }
        drawMeanLoss();
    }

    function pauseMean() {
        if (meanState.timer) clearInterval(meanState.timer);
        meanState.timer = null;
        writeText('stats-auto-run', 'Run steps');
    }

    function stepMean() {
        const batchSize = Number(get('stats-batch-size').value);
        const rate = Number(get('stats-step-size').value);
        const selected = core.sampleIndices(rows.length, batchSize, meanState.random);
        const result = core.meanUpdate(meanState.estimate, rows, selected, rate);
        meanState.previousEstimate = meanState.estimate;
        meanState.lastRate = rate;
        meanState.estimate = result.estimate;
        meanState.selectedMean = result.batchMean;
        meanState.selected = selected;
        meanState.steps++;
        meanState.seen += selected.length;
        meanState.history.push(meanState.estimate);
        renderMean();
    }

    function resetMean() {
        pauseMean();
        meanState.estimate = 60;
        meanState.steps = 0;
        meanState.seen = 0;
        meanState.history = [60];
        meanState.selected = [];
        meanState.selectedMean = null;
        meanState.previousEstimate = null;
        meanState.lastRate = null;
        meanState.random = core.makeRandom(2025 + meanState.sequence);
        renderMean();
    }

    function drawRegression() {
        const canvas = get('stats-regression-chart');
        const ctx = canvas.getContext('2d');
        styleChart(ctx, canvas.width, canvas.height);
        const left = 62, right = canvas.width - 35, top = 30, bottom = canvas.height - 55;
        const x = hours => left + hours / 11 * (right - left);
        const y = score => bottom - (score - 45) / 60 * (bottom - top);
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#42634c';
        ctx.fillStyle = '#d7eadc';
        for (const tick of [0, 2, 4, 6, 8, 10]) {
            ctx.beginPath(); ctx.moveTo(x(tick), top); ctx.lineTo(x(tick), bottom); ctx.stroke();
            ctx.fillText(String(tick), x(tick), bottom + 22);
        }
        ctx.textAlign = 'right';
        for (const tick of [50, 60, 70, 80, 90, 100]) {
            ctx.beginPath(); ctx.moveTo(left, y(tick)); ctx.lineTo(right, y(tick)); ctx.stroke();
            ctx.fillText(String(tick), left - 8, y(tick));
        }
        if (lineState.showReference) {
            ctx.strokeStyle = '#ffd166';
            ctx.lineWidth = 2;
            ctx.setLineDash([7, 6]);
            ctx.beginPath();
            ctx.moveTo(x(0), y(bestLine.intercept));
            ctx.lineTo(x(11), y(bestLine.intercept + bestLine.slope * 11));
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.strokeStyle = '#49a7ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x(0), y(lineState.intercept));
        ctx.lineTo(x(11), y(lineState.intercept + lineState.slope * 11));
        ctx.stroke();
        for (const row of rows) {
            const px = x(row.hours), predicted = lineState.intercept + lineState.slope * row.hours;
            ctx.strokeStyle = '#ff908d';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(px, y(row.score)); ctx.lineTo(px, y(predicted)); ctx.stroke();
            ctx.fillStyle = '#64f4ac';
            ctx.beginPath(); ctx.arc(px, y(row.score), 6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#d7eadc';
        ctx.textAlign = 'center';
        ctx.fillText('Study hours', canvas.width / 2, canvas.height - 15);
        ctx.textAlign = 'left';
        ctx.fillText('Quiz score', left, 14);
        if (lineState.showReference) {
            ctx.fillStyle = '#ffd166';
            ctx.fillText('Dashed: best-fit reference', right - 180, 14);
        }
    }

    function syncLineControls() {
        get('stats-intercept').value = String(Math.max(30, Math.min(90, lineState.intercept)));
        get('stats-slope').value = String(Math.max(-2, Math.min(8, lineState.slope)));
        writeText('stats-intercept-value', format(lineState.intercept, 1));
        writeText('stats-slope-value', format(lineState.slope, 2));
    }

    function renderLine() {
        syncLineControls();
        const error = core.lineMeanSquaredError(rows, lineState.intercept, lineState.slope);
        const selected = lineState.selected.length ? ` Last step used students ${lineState.selected.map(studentName).join(', ')}.` : '';
        writeText('stats-line-summary', `Current line: predicted score = ${format(lineState.intercept, 1)} + ${format(lineState.slope, 2)} × study hours. Average squared error: ${format(error, 1)}. Fitting steps: ${lineState.steps}.${selected}`);
        drawRegression();
    }

    function pauseLine() {
        if (lineState.timer) clearInterval(lineState.timer);
        lineState.timer = null;
        writeText('stats-line-run', 'Fit 30 steps');
    }

    function stepLine() {
        const batchSize = Number(get('stats-line-batch').value);
        const selected = core.sampleIndices(rows.length, batchSize, lineState.random);
        const nextLine = core.lineUpdate(lineState, rows, selected, 0.3);
        lineState.intercept = nextLine.intercept;
        lineState.slope = nextLine.slope;
        lineState.selected = selected;
        lineState.steps++;
        renderLine();
    }

    function resetLine() {
        pauseLine();
        lineState.intercept = 55;
        lineState.slope = 2;
        lineState.steps = 0;
        lineState.selected = [];
        lineState.random = core.makeRandom(2048);
        renderLine();
    }

    function appendResult(list, text) {
        const item = document.createElement('li');
        item.textContent = text;
        list.appendChild(item);
        if (list.children.length > 5) list.firstElementChild.remove();
    }

    let optimizerTrial = 0;
    let sampleTrial = 0;
    const largerClassScores = [...scores, 58, 63, 66, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 89, 91, 93, 95, 97];

    function repeatOptimizer() {
        optimizerTrial++;
        const random = core.makeRandom(7000 + optimizerTrial * 31);
        let estimate = 60;
        for (let step = 0; step < 12; step++) {
            const selected = core.sampleIndices(rows.length, 1, random);
            estimate = core.meanUpdate(estimate, rows, selected, 0.25).estimate;
        }
        appendResult(get('stats-optimizer-results'), `12 short steps: ${format(estimate, 1)} points`);
    }

    function drawNewSample() {
        sampleTrial++;
        const random = core.makeRandom(9000 + sampleTrial * 47);
        const selected = core.sampleIndices(largerClassScores.length, 12, random);
        const sample = selected.map(index => largerClassScores[index]);
        appendResult(get('stats-sample-results'), `New group's exact mean: ${format(core.mean(sample), 1)} points`);
    }

    const checks = {
        mean: { answer: sampleMean, hint: 'Add the 12 scores, then divide by 12.' },
        residual: { answer: 12, hint: 'Subtract the prediction of 70 from the observed score of 82.' },
        step: { answer: 65, hint: 'Find one quarter of the gap between 60 and 80.' }
    };

    function checkAnswer(name) {
        const input = get(`stats-answer-${name}`);
        const feedback = get(`stats-feedback-${name}`);
        const value = Number(input.value);
        if (input.value.trim() === '' || !Number.isFinite(value)) {
            feedback.textContent = 'Enter a number first.';
            feedback.dataset.result = 'incorrect';
        } else if (Math.abs(value - checks[name].answer) <= 0.05) {
            feedback.textContent = 'That’s right. Open the explanation to see why.';
            feedback.dataset.result = 'correct';
        } else {
            feedback.textContent = `Not quite. ${checks[name].hint}`;
            feedback.dataset.result = 'incorrect';
        }
    }

    section.querySelectorAll('[data-stats-check]').forEach(button => {
        button.addEventListener('click', () => checkAnswer(button.dataset.statsCheck));
    });
    for (const name of Object.keys(checks)) {
        get(`stats-answer-${name}`).addEventListener('keydown', event => {
            if (event.key === 'Enter') checkAnswer(name);
        });
    }

    get('stats-step-once').addEventListener('click', () => { pauseMean(); stepMean(); });
    get('stats-auto-run').addEventListener('click', () => {
        if (meanState.timer) { pauseMean(); return; }
        writeText('stats-auto-run', 'Pause steps');
        let remaining = 24;
        meanState.timer = setInterval(() => {
            stepMean();
            if (--remaining === 0) pauseMean();
        }, 500);
    });
    get('stats-reset').addEventListener('click', resetMean);
    get('stats-new-sequence').addEventListener('click', () => { meanState.sequence++; resetMean(); });

    for (const id of ['stats-intercept', 'stats-slope']) {
        get(id).addEventListener('input', () => {
            pauseLine();
            lineState.intercept = Number(get('stats-intercept').value);
            lineState.slope = Number(get('stats-slope').value);
            lineState.selected = [];
            renderLine();
        });
    }
    get('stats-line-step').addEventListener('click', () => { pauseLine(); stepLine(); });
    get('stats-line-run').addEventListener('click', () => {
        if (lineState.timer) { pauseLine(); return; }
        writeText('stats-line-run', 'Pause fitting');
        let remaining = 30;
        lineState.timer = setInterval(() => {
            stepLine();
            if (--remaining === 0) pauseLine();
        }, 150);
    });
    get('stats-line-reset').addEventListener('click', resetLine);
    get('stats-line-reference').addEventListener('click', () => {
        lineState.showReference = !lineState.showReference;
        get('stats-line-reference').setAttribute('aria-pressed', String(lineState.showReference));
        writeText('stats-line-reference', lineState.showReference ? 'Hide best-fit reference' : 'Show best-fit reference');
        renderLine();
    });
    get('stats-repeat-optimizer').addEventListener('click', repeatOptimizer);
    get('stats-new-sample').addEventListener('click', drawNewSample);

    window.pauseStatisticsWorksheet = () => { pauseMean(); pauseLine(); };
    window.renderStatisticsWorksheet = () => { drawDotPlot(); renderMean(); renderLine(); };
    window.renderStatisticsWorksheet();
})();
