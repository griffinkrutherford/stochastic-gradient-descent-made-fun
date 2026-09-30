/* Perspective-rendered, data-derived 3D labs. No external renderer or prewritten fit paths. */
(function () {
    'use strict';
    const $ = id => document.getElementById(id);
    const S = window.StatsCore, M = window.ModelingCore;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const fmt = (v, n = 2) => Number(v).toFixed(n);
    const labs = [];
    const colors = { algebra: '#ff544d', calculus: '#b6a1ff', statistics: '#64f4ac', modeling: '#61c7ff' };
    const hues = { algebra: 3, calculus: 257, statistics: 150, modeling: 201 };
    let mode = document.body.dataset.worksheetMode || 'algebra';

    function lab(version, kind, title, intro, note, destination, before = false) {
        const id = `lab-${version}-${kind}`;
        const element = document.createElement('section');
        element.className = 'visual-lab'; element.dataset.labMode = version;
        element.setAttribute('aria-labelledby', `${id}-title`);
        element.innerHTML = `<div class="lab-kicker">Interactive 3D studio · ${version}</div><h3 id="${id}-title">${title}</h3><p>${intro}</p><div class="lab-stage"><canvas id="${id}-canvas" tabindex="0" role="img" aria-label="${title}. Drag or use arrow keys to rotate; the nearby controls and summary describe the mathematical state."></canvas></div><div class="lab-controls"></div><div class="lab-view-controls"></div><p id="${id}-summary" class="lab-summary" aria-live="polite"></p><p class="lab-note">${note} Drag to orbit; arrow keys rotate, +/− zoom, Home restores the view. Motion follows the header's pause control and reduced-motion setting.</p>`;
        if (before) destination.before(element); else destination.append(element);
        const scene = { id, version, kind, element, canvas: element.querySelector('canvas'), summary: element.querySelector('.lab-summary'), controls: element.querySelector('.lab-controls'), viewControls: element.querySelector('.lab-view-controls'), yaw: -.55, pitch: .65, zoom: 1, orbit: true, visible: false, time: 0, needsDraw: true, state: {}, lastSummary: '', trail: [] };
        scene.ctx = scene.canvas.getContext('2d');
        const orbitButton = button(scene, 'Turntable on', () => {
            scene.orbit = !scene.orbit; orbitButton.textContent = scene.orbit ? 'Turntable on' : 'Turntable off'; orbitButton.setAttribute('aria-pressed', String(scene.orbit));
        }, true, scene.viewControls);
        orbitButton.setAttribute('aria-pressed', 'true'); orbitButton.dataset.labAction = 'orbit';
        button(scene, 'Reset view', () => { scene.yaw = -.55; scene.pitch = .65; scene.zoom = 1; }, true, scene.viewControls).dataset.labAction = 'view';
        let drag = null;
        scene.canvas.addEventListener('pointerdown', event => {
            drag = { x: event.clientX, y: event.clientY }; scene.canvas.setPointerCapture(event.pointerId);
        });
        scene.canvas.addEventListener('pointermove', event => {
            if (!drag) return;
            scene.yaw += (event.clientX - drag.x) * .008;
            scene.pitch = clamp(scene.pitch + (event.clientY - drag.y) * .006, .22, 1.15);
            drag = { x: event.clientX, y: event.clientY };
        });
        const release = () => { drag = null; };
        scene.canvas.addEventListener('pointerup', release); scene.canvas.addEventListener('pointercancel', release);
        scene.canvas.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Home'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'ArrowLeft') scene.yaw -= .12;
            if (event.key === 'ArrowRight') scene.yaw += .12;
            if (event.key === 'ArrowUp') scene.pitch = clamp(scene.pitch + .08, .22, 1.15);
            if (event.key === 'ArrowDown') scene.pitch = clamp(scene.pitch - .08, .22, 1.15);
            if (event.key === '+' || event.key === '=') scene.zoom = clamp(scene.zoom + .1, .65, 1.4);
            if (event.key === '-') scene.zoom = clamp(scene.zoom - .1, .65, 1.4);
            if (event.key === 'Home') { scene.yaw = -.55; scene.pitch = .65; scene.zoom = 1; }
        });
        const observer = new IntersectionObserver(entries => { scene.visible = entries[0].isIntersecting; }, { rootMargin: '100px' });
        observer.observe(scene.canvas);
        new ResizeObserver(() => { scene.needsDraw = true; }).observe(scene.canvas);
        labs.push(scene); return scene;
    }
    function button(scene, text, action, secondary = false, parent = scene.controls) {
        const element = document.createElement('button'); element.type = 'button'; element.textContent = text;
        if (secondary) element.className = 'lab-secondary'; element.addEventListener('click', action); parent.append(element); return element;
    }
    function slider(scene, key, label, min, max, step, initial, change = () => {}) {
        scene.state[key] = initial;
        const wrapper = document.createElement('label'), input = document.createElement('input'), output = document.createElement('output');
        input.id = `${scene.id}-${key}`; input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = initial;
        wrapper.htmlFor = input.id; output.textContent = fmt(initial, 1); wrapper.append(`${label}: `, output, input); scene.controls.append(wrapper);
        input.addEventListener('input', () => { scene.state[key] = Number(input.value); output.textContent = fmt(scene.state[key], 1); change(scene.state[key]); });
        scene.state[`${key}Input`] = input; scene.state[`${key}Output`] = output;
        return input;
    }
    function say(scene, text) {
        if (scene.lastSummary === text) return;
        scene.lastSummary = text; scene.summary.textContent = text;
    }

    // A small painter's-order renderer: lit translucent meshes, projected depth, and glowing markers.
    function renderer(scene) {
        const rect = scene.canvas.getBoundingClientRect(), W = rect.width, H = rect.height;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.round(W * pixelRatio), height = Math.round(H * pixelRatio);
        if (scene.canvas.width !== width || scene.canvas.height !== height) { scene.canvas.width = width; scene.canvas.height = height; }
        const ctx = scene.ctx; ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        const bg = ctx.createRadialGradient(W * .5, H * .5, 20, W * .5, H * .5, W * .65);
        bg.addColorStop(0, '#14223a'); bg.addColorStop(1, '#060a12'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
        const unit = Math.min(W / 14, H / 12.2), cy = Math.cos(scene.yaw), sy = Math.sin(scene.yaw), cp = Math.cos(scene.pitch), sp = Math.sin(scene.pitch);
        const queue = [], labels = [], projectedPoints = [];
        let inset = null;
        function project([x, y, z]) {
            const rx = x * cy + z * sy, rz = -x * sy + z * cy;
            const depth = y * sp + rz * cp, perspective = 22 / (22 - depth);
            const result = { x: W / 2 + rx * unit * perspective, y: H * .67 - (y * cp - rz * sp) * unit * perspective, depth, scale: perspective };
            projectedPoints.push(result); return result;
        }
        function polygon(points, fill, stroke = null) {
            const pts = points.map(project); queue.push({ depth: pts.reduce((sum, p) => sum + p.depth, 0) / pts.length, draw() {
                ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
                ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = .65; ctx.stroke(); }
            } });
        }
        function line(points, color, width = 1.5, dashed = false, overlay = false) {
            const pts = points.map(project); queue.push({ depth: pts.reduce((sum, p) => sum + p.depth, 0) / pts.length + .03 + (overlay ? 100000 : 0), draw() {
                ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
                ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dashed ? [5, 5] : []); ctx.stroke(); ctx.setLineDash([]);
            } });
        }
        function orb(position, color, radius = 7, overlay = false) {
            const p = project(position); queue.push({ depth: p.depth + .1 + (overlay ? 100000 : 0), draw() {
                const r = radius * p.scale, gradient = ctx.createRadialGradient(p.x - r * .3, p.y - r * .4, 0, p.x, p.y, r);
                gradient.addColorStop(0, '#fff'); gradient.addColorStop(.35, color); gradient.addColorStop(1, '#182538');
                ctx.shadowColor = color; ctx.shadowBlur = 14; ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
            } });
        }
        function label(position, text, color = '#cedeed') { labels.push({ p: project(position), text, color }); }
        function mesh(fn, n = 24, extent = 4, depthExtent = extent) {
            const nz = Math.max(6, Math.round(n * depthExtent / extent));
            const delta = extent * 2 / n, dzStep = depthExtent * 2 / nz;
            for (let i = 0; i < n; i++) for (let j = 0; j < nz; j++) {
                const x = -extent + i * delta, z = -depthExtent + j * dzStep;
                const points = [[x, fn(x, z), z], [x + delta, fn(x + delta, z), z], [x + delta, fn(x + delta, z + dzStep), z + dzStep], [x, fn(x, z + dzStep), z + dzStep]];
                const h = points.reduce((s, p) => s + p[1], 0) / 4;
                const dx = (fn(x + .03, z) - fn(x - .03, z)) / .06, dz = (fn(x, z + .03) - fn(x, z - .03)) / .06;
                const light = clamp((1.6 - .3 * dx - .5 * dz) / Math.sqrt(1 + dx * dx + dz * dz), .15, 1);
                polygon(points, `hsla(${hues[scene.version] + h * 4},65%,${20 + light * 20 + h * 2}%,.77)`, `hsla(${hues[scene.version]},85%,70%,.20)`);
            }
        }
        function plane(fn, color) {
            const e = 3.8; polygon([[-e, fn(-e, -e), -e], [e, fn(e, -e), -e], [e, fn(e, e), e], [-e, fn(-e, e), e]], color, '#e4efff88');
        }
        function floor(xLabel, zLabel, yLabel = 'Height') {
            for (let i = -4; i <= 4; i++) {
                line([[-4.6, -.05, i], [4.6, -.05, i]], '#6586ae24', .7);
                line([[i, -.05, -4.6], [i, -.05, 4.6]], '#6586ae24', .7);
            }
            line([[-4.5, 0, 0], [4.7, 0, 0]], '#a9c3da', 1.3);
            line([[0, 0, -4.5], [0, 0, 4.7]], '#a9c3da', 1.3);
            line([[-4.3, 0, -4.3], [-4.3, 5.3, -4.3]], '#a9c3da', 1.3);
            label([4.7, 0, 0], xLabel); label([0, 0, 4.7], zLabel); label([-4.3, 5.5, -4.3], yLabel);
        }
        function profile(title, draw) { inset = { title, draw }; }
        function finish() {
            const xs = projectedPoints.map(p => p.x), ys = projectedPoints.map(p => p.y);
            const leftEdge = Math.min(...xs), rightEdge = Math.max(...xs), topEdge = Math.min(...ys), bottomEdge = Math.max(...ys);
            const frameScale = Math.min(1, (W - 44) / (rightEdge - leftEdge), (H - 65) / (bottomEdge - topEdge)) * scene.zoom;
            const centerX = (leftEdge + rightEdge) / 2, centerY = (topEdge + bottomEdge) / 2;
            projectedPoints.forEach(p => { p.x = W / 2 + (p.x - centerX) * frameScale; p.y = H * .51 + (p.y - centerY) * frameScale; p.scale *= frameScale; });
            queue.sort((a, b) => a.depth - b.depth).forEach(item => item.draw());
            ctx.font = `${W < 400 ? 11 : 13}px Arial`; ctx.textAlign = 'center';
            const insetWidth = W < 400 ? 113 : 170, insetHeight = W < 400 ? 91 : 125;
            const occupied = inset ? [{ x: W - insetWidth / 2 - 12, y: 12 + insetHeight / 2, half: insetWidth / 2, height: insetHeight }] : [];
            for (const { p, text, color } of labels) {
                const metrics = ctx.measureText(text), half = metrics.width / 2 + 5;
                const x = clamp(p.x, half + 6, W - half - 6);
                let y = clamp(p.y, 24, H - 28);
                for (let attempt = 0; attempt < 12; attempt++) {
                    const collides = occupied.some(rect => Math.abs(rect.x - x) < rect.half + half + 4 && Math.abs(rect.y - y) < (rect.height || 20) / 2 + 11);
                    if (!collides) break;
                    y = clamp(p.y + (attempt % 2 ? -1 : 1) * (Math.floor(attempt / 2) + 1) * 24, 24, H - 28);
                }
                if (Math.abs(y - p.y) > 16 || Math.abs(x - p.x) > 16) {
                    ctx.strokeStyle = '#c2d7e977'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(x, y - 7); ctx.stroke();
                }
                occupied.push({ x, y, half });
                ctx.fillStyle = '#060c16d9'; ctx.fillRect(x - half, y - 14, half * 2, 20);
                ctx.fillStyle = color; ctx.fillText(text, x, y);
            }
            ctx.textAlign = 'left'; ctx.font = '11px ui-monospace, monospace'; ctx.fillStyle = '#9bb7cf';
            ctx.fillText('DRAG TO ORBIT  /  DATA → GEOMETRY', 12, H - 12);
            if (inset) {
                const w = W < 400 ? 113 : 170, h = W < 400 ? 91 : 125;
                const left = W - w - 12, top = 12;
                ctx.fillStyle = '#08121ff2'; ctx.fillRect(left, top, w, h);
                ctx.strokeStyle = '#6586ae88'; ctx.lineWidth = 1; ctx.strokeRect(left, top, w, h);
                ctx.fillStyle = '#d9eaff'; ctx.font = `${W < 400 ? 10 : 12}px Arial`; ctx.textAlign = 'left';
                const title = W < 400 ? inset.title.replace(' · this cap', '').replace('Full-data error contours', 'Error contours').replace('Contour map · u² + v²', 'Contours: u² + v²').replace('Side profile · y = x²', 'y = x² side profile') : inset.title;
                ctx.fillText(title, left + 8, top + 16);
                ctx.save(); ctx.beginPath(); ctx.rect(left + 5, top + 24, w - 10, h - 29); ctx.clip();
                inset.draw(ctx, left + 10, top + 28, w - 20, h - 38); ctx.restore();
            }

        }
        return { project, polygon, line, orb, label, mesh, plane, floor, profile, finish };
    }

    const firstQuestion = $('answer-1').closest('.question');
    const fifthQuestion = $('answer-5').closest('.question');
    for (const version of ['algebra', 'calculus']) {
        const bridge = lab(version, 'bridge', version === 'algebra' ? 'Build a secant skybridge' : 'Watch a secant become a tangent',
            version === 'algebra' ? 'Two glowing points sit on y = x². Move either end of the bridge: its rise divided by its run is the slope.' : 'Bring the second point closer to the first on y = x². The yellow tangent has slope 2x; the secant slope approaches it as the gap shrinks.',
            'Glowing guides stay visible through the surface. The ribbon is y = x² extruded for a 3D view; its depth is decorative, not another input. The plotted height is scaled to fit the screen.', firstQuestion);
        slider(bridge, 'x', 'First x', -3, 2, .1, -2);
        slider(bridge, 'gap', 'Positive x gap', .05, 2, .05, 1.5);
        button(bridge, 'Try a level bridge', () => { bridge.state.x = -1; bridge.state.gap = 2; syncSliders(bridge, ['x', 'gap']); });
        const terrain = lab(version, 'terrain', version === 'algebra' ? 'Scout a two-input landscape' : 'Fly the gradient flight deck',
            version === 'algebra' ? 'Try a point on F(u,v) = u² + v². A scout tests four nearby points and chooses one with smaller height. Predict the next move before taking a step.' : 'The same surface is F(u,v) = u² + v². The purple tangent plane touches the current point, and the yellow arrow points opposite the gradient (2u, 2v).',
            'This is an actual quadratic surface, with height scaled by 0.16 for display. The trail records your computed steps. Rings join points at the same height.', fifthQuestion);
        slider(terrain, 'u', 'u', -3.5, 3.5, .1, 3);
        slider(terrain, 'v', 'v', -3.5, 3.5, .1, -2);
        button(terrain, version === 'algebra' ? 'Test nearby points & step' : 'Take a gradient step', () => {
            const { u, v } = terrain.state;
            terrain.trail.push([u, v]);
            if (version === 'algebra') {
                const candidates = [[u + .4, v], [u - .4, v], [u, v + .4], [u, v - .4], [u, v]];
                candidates.sort((a, b) => a[0] ** 2 + a[1] ** 2 - b[0] ** 2 - b[1] ** 2);
                [terrain.state.u, terrain.state.v] = candidates[0];
            } else { terrain.state.u = u - .15 * (2 * u); terrain.state.v = v - .15 * (2 * v); }
            syncSliders(terrain, ['u', 'v']);
        }).dataset.labAction = 'step';
        button(terrain, 'Reset trail', () => { terrain.state.u = 3; terrain.state.v = -2; terrain.trail = []; syncSliders(terrain, ['u', 'v']); }, true);
    }
    function syncSliders(scene, keys) {
        keys.forEach(key => { scene.state[`${key}Input`].value = scene.state[key]; scene.state[`${key}Output`].textContent = fmt(scene.state[key], 1); });
    }

    const skyline = lab('statistics', 'skyline', 'Walk through the arcade score skyline',
        'Each glowing tower is one player’s score. The floating platform is your candidate average. Move it: the colored vertical gaps are residuals. Which height makes the total squared gaps smallest?',
        'Player locations on the floor are decorative; tower height is measured in arcade points (baseline 40). Gold caps are observed scores, and the green platform is the current estimate. On phones, tower numbers follow the data-table order; choose a player to inspect its residual.', $('stats-dot-plot'), true);
    slider(skyline, 'estimate', 'Candidate average (points)', 45, 100, .1, 60);
    skyline.state.player = 0;
    const playerLabel = document.createElement('label'), playerSelect = document.createElement('select');
    playerSelect.id = 'lab-statistics-skyline-player'; playerLabel.htmlFor = playerSelect.id;
    playerSelect.innerHTML = S.PLAYERS.map((row, i) => `<option value="${i}">${i + 1}. ${row.name}</option>`).join('');
    playerLabel.append('Inspect one player: ', playerSelect); skyline.controls.append(playerLabel);
    playerSelect.addEventListener('change', () => { skyline.state.player = Number(playerSelect.value); });
    button(skyline, 'Move 25% toward the mean', () => { skyline.state.estimate += .25 * (76 - skyline.state.estimate); syncSliders(skyline, ['estimate']); }).dataset.labAction = 'step';
    button(skyline, 'Reset to 60', () => { skyline.state.estimate = 60; syncSliders(skyline, ['estimate']); }, true);

    const statsFit = lab('statistics', 'fit', 'Orbit the real prediction-error bowl',
        'This bowl is calculated from all 12 player scorecards. A bright marble is the line in the controls below. Step the fit and watch its actual path across the fixed surface.',
        'Floor axes: predicted score at 5.5 practice rounds, and slope in points per round. Vertical height: full-data average squared error, scaled for display. The gold ring marks the reference fit. This is a separate, convex surface from the illustrative multi-dent bowl later.', $('stats-intercept').closest('.stats-control-grid'), true);
    button(statsFit, 'Take the selected-batch step', () => $('stats-line-step').click()).dataset.labAction = 'step';
    button(statsFit, 'Reset fit', () => $('stats-line-reset').click(), true);

    const market = lab('modeling', 'market', 'Fly over the café profit landscape',
        'Play before calculating: move price and serving capacity. The height is predicted hourly profit. A higher point can earn more, but affordable access and waste still matter. The gold ridge shows the best 25¢-grid price at each capacity.',
        'This is the actual Q6 decision model, using the current demand fit and costs. Axes: price ($/cup), capacity (cups/hour), profit ($/hour). Profit has a display offset and scale; read the exact dollars below. These controls stay linked to the planner.', $('modeling-worksheet').querySelector('.model-intro'));
    slider(market, 'price', 'Price ($/cup)', 3, 6, .25, 5, value => { $('model-price').value = value; $('model-price').dispatchEvent(new Event('input')); });
    slider(market, 'capacity', 'Capacity (cups/hour)', 20, 80, 5, 40, value => { $('model-capacity').value = value; $('model-capacity').dispatchEvent(new Event('input')); });
    button(market, 'Use the best-fit demand line', () => $('model-use-reference').click());
    const modelFit = lab('modeling', 'fit', 'See Byte’s actual fitting bowl',
        'The surface measures prediction error on the seven café pilots. Step the line, and the marble follows its computed coefficient updates. Predict whether a random-batch move must always go downhill on the full-data bowl.',
        'Floor axes: predicted cups/hour at $4.50, and demand slope. Vertical height: average squared error, scaled for display. Gold marks the best-fit reference. The surface stays fixed while the candidate line moves.', $('model-intercept').closest('.stats-control-grid'), true);
    button(modelFit, 'Take the selected-pilot step', () => $('model-step').click()).dataset.labAction = 'step';
    button(modelFit, 'Reset fit', () => $('model-reset').click(), true);

    function bridgeScene(scene, r) {
        const { x, gap } = scene.state, b = x + gap, fa = x * x, fb = b * b, slope = (fb - fa) / gap;
        r.floor('x', 'Ribbon depth', 'y = x²');
        r.mesh((u) => u * u * .22, 26, 4, 1.3);
        const A = [x, fa * .22 + .035, 0], B = [b, fb * .22 + .035, 0];
        r.line([[x, 0, 0], A], '#ffd16677', 1.5, true); r.line([[b, 0, 0], B], '#ffd16677', 1.5, true);
        r.line([A, B], colors[scene.version], 4, false, true);
        r.line([A, [b, fa * .22, 0], B], '#ffd166', 2, true, true);
        r.orb(A, '#ffd166', 9, true); r.orb(B, colors[scene.version], 9, true);
        const t = (scene.time * .28) % 1;
        r.orb(A.map((v, i) => v + (B[i] - v) * t), '#fff', 4, true);
        if (scene.version === 'calculus') {
            r.line([[x - 1.4, (fa - 2 * x * 1.4) * .22, 0], [x + 1.4, (fa + 2 * x * 1.4) * .22, 0]], '#ffd166', 3, false, true);
        }
        r.label(A.map((v, i) => i === 1 ? v + .45 : v), `(${fmt(x, 1)}, ${fmt(fa, 1)})`, '#ffd166');
        r.label(B.map((v, i) => i === 1 ? v + .45 : v), `(${fmt(b, 2)}, ${fmt(fb, 2)})`, colors[scene.version]);
        r.profile('Side profile · y = x²', (ctx, left, top, w, h) => {
            const px = t => left + (t + 4) / 8 * w, py = t => top + h - t / 16 * h;
            ctx.strokeStyle = '#47617d'; ctx.beginPath(); ctx.moveTo(left, top + h); ctx.lineTo(left + w, top + h); ctx.stroke();
            ctx.strokeStyle = colors[scene.version]; ctx.lineWidth = 1.5; ctx.beginPath();
            for (let t = -4; t <= 4; t += .1) { if (t === -4) ctx.moveTo(px(t), py(t * t)); else ctx.lineTo(px(t), py(t * t)); } ctx.stroke();
            if (scene.version === 'calculus') { ctx.strokeStyle = '#ffd166'; ctx.beginPath(); ctx.moveTo(px(x - 2), py(fa - 4 * x)); ctx.lineTo(px(x + 2), py(fa + 4 * x)); ctx.stroke(); }
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px(x), py(fa)); ctx.lineTo(px(b), py(fb)); ctx.stroke();
            for (const [a, height, color] of [[x, fa, '#ffd166'], [b, fb, colors[scene.version]]]) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px(a), py(height), 3, 0, Math.PI * 2); ctx.fill(); }
        });
        say(scene, `Rise ${fmt(fb - fa)} ÷ run ${fmt(gap)} = secant slope ${fmt(slope)}. ${scene.version === 'calculus' ? `Tangent slope at x = ${fmt(x, 1)} is 2x = ${fmt(2 * x)}; their difference is ${fmt(slope - 2 * x)}. Shrink the gap to explore the limit.` : 'The bridge is level when its endpoints have equal heights, even when the curve bends between them.'}`);
    }
    function terrainScene(scene, r) {
        const { u, v } = scene.state, f = (a, b) => .16 * (a * a + b * b);
        r.floor('u', 'v', 'F(u,v)'); r.mesh(f);
        for (const radius of [1, 2, 3]) {
            const pts = Array.from({ length: 81 }, (_, i) => { const t = i / 80 * Math.PI * 2; return [radius * Math.cos(t), .16 * radius * radius + .025, radius * Math.sin(t)]; });
            r.line(pts, '#a7d2ff66', 1.2);
        }
        if (scene.version === 'calculus') {
            const f0 = f(u, v), plane = (a, b) => f0 + .32 * u * (a - u) + .32 * v * (b - v);
            const d = 1;
            r.polygon([[u - d, plane(u - d, v - d), v - d], [u + d, plane(u + d, v - d), v - d], [u + d, plane(u + d, v + d), v + d], [u - d, plane(u - d, v + d), v + d]], '#b6a1ff44', '#d6cbff');
            const end = [u * .7, f(u * .7, v * .7) + .1, v * .7];
            r.line([[u, f0 + .12, v], end], '#ffd166', 4); r.orb(end, '#ffd166', 4);
        }
        const trail = [...scene.trail, [u, v]].map(([a, b]) => [a, f(a, b) + .06, b]);
        if (trail.length > 1) r.line(trail, '#ffd166', 2.5, false, true);
        r.line([[u, 0, v], [u, f(u, v), v]], '#fff6', 1, true);
        r.orb([u, f(u, v) + .14, v], colors[scene.version], 10, true);
        r.orb([0, .12, 0], '#ffd166', 5);
        r.profile('Contour map · u² + v²', (ctx, left, top, w, h) => {
            const scale = Math.min(w, h) / 8, cx = left + w / 2, cy = top + h / 2;
            ctx.strokeStyle = '#47617d'; ctx.lineWidth = 1;
            for (const radius of [1, 2, 3]) { ctx.beginPath(); ctx.arc(cx, cy, radius * scale, 0, Math.PI * 2); ctx.stroke(); }
            ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.5; ctx.beginPath();
            [...scene.trail, [u, v]].forEach(([a, b], i) => i ? ctx.lineTo(cx + a * scale, cy - b * scale) : ctx.moveTo(cx + a * scale, cy - b * scale)); ctx.stroke();
            ctx.fillStyle = colors[scene.version]; ctx.beginPath(); ctx.arc(cx + u * scale, cy - v * scale, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
        });
        say(scene, `At (u,v) = (${fmt(u)}, ${fmt(v)}), F = u² + v² = ${fmt(u * u + v * v)}. ${scene.version === 'calculus' ? `Gradient = (${fmt(2 * u)}, ${fmt(2 * v)}). One step subtracts 0.15 × each gradient component.` : 'The scout compares offsets of 0.4 in each input and stays put if none is lower; it can stop near the minimum at this resolution.'} ${scene.trail.length} computed steps in this trail.`);
    }
    function skylineScene(scene, r) {
        const estimate = scene.state.estimate, height = value => (value - 40) * .075;
        r.floor('Player layout', 'Decorative depth', 'Arcade points');
        S.PLAYERS.forEach((row, i) => {
            const x = (i % 6 - 2.5) * 1.45, z = (Math.floor(i / 6) - .5) * 3, y = height(row.score), width = .27;
            const hue = 145 + i * 4;
            r.polygon([[x - width, 0, z - width], [x + width, 0, z - width], [x + width, y, z - width], [x - width, y, z - width]], `hsla(${hue},60%,36%,.8)`, '#80ffc344');
            r.polygon([[x + width, 0, z - width], [x + width, 0, z + width], [x + width, y, z + width], [x + width, y, z - width]], `hsla(${hue},60%,25%,.8)`, '#80ffc344');
            r.polygon([[x - width, y, z - width], [x + width, y, z - width], [x + width, y, z + width], [x - width, y, z + width]], '#ffd166');
            r.line([[x, y + .04, z], [x, height(estimate), z]], row.score > estimate ? '#61c7ff' : '#ff8c9f', 3);
            r.orb([x, y + .06, z], '#ffd166', 4);
            const t = (scene.time * .3 + i / 12) % 1;
            r.orb([x, y + (height(estimate) - y) * t, z], row.score > estimate ? '#61c7ff' : '#ff8c9f', 2.5);
            const phone = scene.canvas.clientWidth < 400;
            r.label([x, y + .5, z], phone && i !== scene.state.player ? String(i + 1) : `${row.name} ${row.score}`, i === scene.state.player ? '#fff' : '#ffe6a6');
        });
        r.plane(() => height(estimate), '#64f4ac22');
        const inspected = S.PLAYERS[scene.state.player];
        say(scene, `${inspected.name}: score ${inspected.score} − estimate ${fmt(estimate)} = residual ${fmt(inspected.score - estimate)} points. Candidate average ${fmt(estimate)} points. Average squared residual: ${fmt(S.meanSquaredError(S.PLAYERS, estimate))} points². Blue gaps: score above estimate; pink: below. One 25% full-data update is ${fmt(estimate)} + 0.25 × (76 − ${fmt(estimate)}). The decorative pulses show gaps; they do not sample rows or update the estimate.`);
    }
    function fitScene(scene, r) {
        const stats = scene.version === 'statistics';
        const rows = stats ? S.PLAYERS : M.PILOTS;
        const best = stats ? S.leastSquaresLine(rows) : M.fit(rows);
        const current = stats ? window.getStatisticsLine() : window.getModelingLine();
        const centerInput = stats ? 5.5 : 4.5, mean = best.intercept + best.slope * centerInput;
        const cScale = stats ? 5.5 : 5, bScale = stats ? .75 : 2;
        const loss = (c, b) => stats ? S.lineMeanSquaredError(rows, c - b * centerInput, b) : M.error({ intercept: c - b * centerInput, slope: b }, rows);
        const minLoss = loss(mean, best.slope), yScale = stats ? .009 : .011;
        const surface = (u, v) => .2 + (loss(mean + cScale * u, best.slope + bScale * v) - minLoss) * yScale;
        r.floor(stats ? 'Score at 5.5 rounds' : 'Cups/hour at $4.50', stats ? 'Points / round' : 'Demand slope', 'Squared error');
        r.mesh(surface);
        const c = current.intercept + current.slope * centerInput, u = (c - mean) / cScale, v = (current.slope - best.slope) / bScale;
        scene.trail = current.path.map(point => [(point.intercept + point.slope * centerInput - mean) / cScale, (point.slope - best.slope) / bScale]);
        let segment = [];
        for (const [a, b] of scene.trail) {
            if (Math.abs(a) <= 4 && Math.abs(b) <= 4) segment.push([a, surface(a, b) + .05, b]);
            else { if (segment.length > 1) r.line(segment, '#ffd166', 2.5, false, true); segment = []; }
        }
        if (segment.length > 1) r.line(segment, '#ffd166', 2.5, false, true);
        const ring = Array.from({ length: 65 }, (_, i) => { const t = i * Math.PI * 2 / 64; return [.26 * Math.cos(t), .24, .26 * Math.sin(t)]; });
        r.line(ring, '#ffd166', 2.5);
        const inside = Math.abs(u) <= 4 && Math.abs(v) <= 4;
        if (inside) {
            r.line([[u, 0, v], [u, surface(u, v), v]], '#fff8', 1, true);
            r.orb([u, surface(u, v) + .12, v], colors[scene.version], 10, true);
        }
        r.profile('Full-data error contours', (ctx, left, top, w, h) => {
            const kx = surface(1, 0) - surface(0, 0), kz = surface(0, 1) - surface(0, 0), sx = w / 8, sz = h / 8;
            const cx = left + w / 2, cy = top + h / 2; ctx.strokeStyle = '#7189a4'; ctx.lineWidth = 1;
            for (const level of [.15, .5, 1.1]) { ctx.beginPath(); ctx.ellipse(cx, cy, Math.sqrt(level / kx) * sx, Math.sqrt(level / kz) * sz, 0, 0, Math.PI * 2); ctx.stroke(); }
            ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();
            if (inside) { ctx.fillStyle = colors[scene.version]; ctx.beginPath(); ctx.arc(cx + u * sx, cy - v * sz, 4, 0, Math.PI * 2); ctx.fill(); }
        });
        say(scene, `Current ${stats ? 'arcade' : 'café'} line: intercept ${fmt(current.intercept)}, slope ${fmt(current.slope)}. Prediction at ${centerInput}${stats ? ' practice rounds' : ' dollars/cup'}: ${fmt(c)}. Full-data squared error ${fmt(loss(c, current.slope))}; reference ${fmt(minLoss)}. ${current.steps} actual fitting updates. ${inside ? 'The marble uses the same live line as the controls below.' : 'The candidate is outside this displayed coefficient window; reset or adjust the line to bring it back.'} Floor ranges: center prediction ${fmt(mean - 4 * cScale, 1)}–${fmt(mean + 4 * cScale, 1)}; slope ${fmt(best.slope - 4 * bScale, 1)}–${fmt(best.slope + 4 * bScale, 1)}.`);
    }
    function marketScene(scene, r) {
        const line = window.getModelingLine();
        const cost = Number($('model-variable-cost').value), fixed = Number($('model-fixed-cost').value);
        const price = Number($('model-price').value), capacity = Number($('model-capacity').value);
        scene.state.price = price; scene.state.capacity = capacity; syncSliders(scene, ['price', 'capacity']);
        const priceOf = x => 4.5 + x * .375, capacityOf = z => 50 + z * 7.5;
        const height = (x, z) => (M.plan(line, priceOf(x), cost, fixed, capacityOf(z)).profit + 60) / 45;
        r.floor('Price $3 → $6', 'Capacity 20 → 80', 'Profit $/hour'); r.mesh(height);
        const ridge = Array.from({ length: 31 }, (_, i) => {
            const cap = 20 + i * 2, best = M.bestPrice(line, cost, fixed, cap), x = (best.price - 4.5) / .375, z = (cap - 50) / 7.5;
            return [x, height(x, z) + .04, z];
        });
        r.line(ridge, '#ffd166', 2.5);
        const x = (price - 4.5) / .375, z = (capacity - 50) / 7.5;
        r.orb([x, height(x, z) + .12, z], '#61c7ff', 11, true);
        r.line([[x, 0, z], [x, height(x, z), z]], '#fff8', 1, true);
        const plan = M.plan(line, price, cost, fixed, capacity), best = M.bestPrice(line, cost, fixed, capacity);
        r.profile('Profit vs price · this cap', (ctx, left, top, w, h) => {
            const data = Array.from({ length: 61 }, (_, i) => { const p = 3 + i / 20; return [p, M.plan(line, p, cost, fixed, capacity).profit]; });
            const low = Math.min(...data.map(p => p[1])), high = Math.max(...data.map(p => p[1])) + 1;
            const px = p => left + (p - 3) / 3 * w, py = profit => top + h - (profit - low) / (high - low) * h;
            ctx.strokeStyle = '#61c7ff'; ctx.lineWidth = 1.7; ctx.beginPath(); data.forEach(([p, value], i) => i ? ctx.lineTo(px(p), py(value)) : ctx.moveTo(px(p), py(value))); ctx.stroke();
            for (const [p, value, color] of [[price, plan.profit, '#fff'], [best.price, best.profit, '#ffd166']]) { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(px(p), py(value), 3.5, 0, Math.PI * 2); ctx.fill(); }
        });
        say(scene, `Price $${fmt(price)}/cup; capacity ${capacity} cups/hour. Current fit predicts ${fmt(plan.demand, 1)} cups/hour demand and ${fmt(plan.sales, 1)} sales/hour → $${fmt(plan.profit)}/hour profit. Best 25¢-grid price at this capacity: $${fmt(best.price)}. Supply cost $${fmt(cost)}/cup; fixed cost $${fmt(fixed)}/hour. Change the Q4 fit or Q6 costs and this landscape changes too.`);
    }

    window.syncVisualLabs = nextMode => {
        mode = nextMode;
        labs.forEach(scene => { scene.element.hidden = scene.version !== mode; scene.needsDraw = true; });
    };
    window.syncVisualLabs(mode);
    let previous = performance.now(), lastDraw = 0;
    function draw(now) {
        const dt = Math.min(.05, (now - previous) / 1000); previous = now;
        if (now - lastDraw >= 32) {
            lastDraw = now;
            const paused = window.areWorksheetAnimationsPaused();
            for (const scene of labs) {
                if (scene.version !== mode || !scene.canvas.clientWidth || !scene.canvas.clientHeight || (!scene.visible && !scene.needsDraw) || document.hidden) continue;
                scene.needsDraw = false;
                if (!paused) { scene.time += dt * 2; if (scene.orbit) scene.yaw += dt * .075; }
                const r = renderer(scene);
                if (scene.kind === 'bridge') bridgeScene(scene, r);
                if (scene.kind === 'terrain') terrainScene(scene, r);
                if (scene.kind === 'skyline') skylineScene(scene, r);
                if (scene.kind === 'fit') fitScene(scene, r);
                if (scene.kind === 'market') marketScene(scene, r);
                r.finish();
            }
        }
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
})();
