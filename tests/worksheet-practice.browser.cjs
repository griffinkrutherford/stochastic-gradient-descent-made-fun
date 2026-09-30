const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
    const browser = await chromium.launch({ headless: true,
        ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    try {
        const url = process.env.WORKSHEET_URL || 'http://127.0.0.1:8000/';
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(url, { waitUntil: 'load' });
        const selectMode = mode => page.locator(`label[for="mode-${mode}"]`).click();
        const input = number => page.locator(`#practice-input-${number}`);
        const feedback = number => page.locator(`#answer-${number}`);
        const check = async (number, text) => {
            await input(number).fill(text);
            await page.locator(`[data-question="${number}"]`).click();
            return feedback(number).getAttribute('data-result');
        };
        assert.equal(await check(1, ''), 'empty');
        assert.ok((await page.locator('#practice-progress').textContent()).includes('0 of 14'));
        assert.equal(await check(1, '(x2-x1)/(y2-y1)'), 'retry');
        assert.equal(await check(1, 'm=(y₂-y₁)/(x₂-x₁)'), 'correct');
        assert.equal(await input(1).getAttribute('aria-describedby'), 'answer-1');
        assert.equal(await feedback(1).getAttribute('aria-live'), 'polite');
        assert.equal(await input(1).evaluate(element => element.closest('.question').querySelector('details').open), false);
        assert.equal(await check(3, '-b/2*a'), 'retry');
        await input(3).fill('-b/(2a)');
        await input(3).press('Enter');
        assert.equal(await feedback(3).getAttribute('data-result'), 'correct');
        await input(3).fill('-b/(3a)');
        assert.equal(await feedback(3).isVisible(), false);

        const written = {
            2: 'Horizontal, not vertical.', 4: 'The slope is zero.',
            5: 'Negative on the left, zero at the vertex, positive on the right.',
            6: 'Minimize pollution to reduce waste and save resources.',
            7: 'A minimum because we want less pollution.',
            8: 'Many inputs and variables affect real results.',
            9: 'Follow the slope downhill in small repeated steps.',
            10: 'Use the gradient to take repeated small steps downhill.',
            11: 'Random movement lets marbles escape shallow local traps.',
            12: 'Random shaking can help escape a trap but too much prevents settling.',
            13: 'Higher temperature increases variety; lower temperature concentrates the probabilities.',
            14: 'Slope guides steps that reduce prediction error in an AI model.'
        };
        for (const [number, answer] of Object.entries(written)) {
            const status = await check(number, answer);
            assert.ok(['correct', 'review'].includes(status), `Question ${number}: ${status}`);
        }
        assert.equal(await check(10, 'Use a gradient.'), 'review');
        assert.ok((await feedback(10).textContent()).includes('repeated small steps'));
        await input(10).fill(written[10]);
        await input(10).press('Control+Enter');
        assert.ok((await feedback(10).textContent()).includes('Ideas recognized'));
        console.log('PASS: all 14 answers get specific feedback; edits, Enter, and Ctrl+Enter work.');

        await selectMode('calculus');
        assert.equal(await input(1).inputValue(), '');
        assert.equal(await check(1, 'rise/run'), 'retry');
        assert.equal(await check(1, "f'(x)"), 'correct');
        assert.equal(await page.locator('h1').evaluate(element => getComputedStyle(element).color), 'rgb(182, 161, 255)');
        assert.equal(await page.evaluate(() => worksheetAccent), '#b6a1ff');
        await page.reload({ waitUntil: 'load' });
        await selectMode('calculus');
        assert.equal(await input(1).inputValue(), "f'(x)");
        assert.equal(await feedback(1).getAttribute('data-result'), 'correct');
        await selectMode('algebra');
        assert.equal(await input(1).inputValue(), 'm=(y₂-y₁)/(x₂-x₁)');
        assert.equal(await page.locator('h1').evaluate(element => getComputedStyle(element).color), 'rgb(225, 6, 0)');
        assert.equal(await feedback(1).getAttribute('data-result'), 'correct');
        console.log('PASS: versions have separate saved drafts, feedback, and color schemes.');

        await check(14, '<img src=x onerror="window.answerInjected=true">');
        assert.equal(await page.evaluate(() => window.answerInjected), undefined);
        for (const width of [390, 320]) {
            await page.setViewportSize({ width, height: 844 });
            for (const mode of ['algebra', 'calculus', 'statistics']) {
                await selectMode(mode);
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            }
        }
        const blocked = await browser.newPage();
        blocked.on('pageerror', error => errors.push(error.message));
        await blocked.addInitScript(() => {
            Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage blocked'); } });
        });
        await blocked.goto(url, { waitUntil: 'load' });
        await blocked.locator('#practice-input-4').fill('0');
        await blocked.locator('[data-question="4"]').click();
        assert.equal(await blocked.locator('#answer-4').getAttribute('data-result'), 'correct');
        assert.ok((await blocked.locator('#practice-progress').textContent()).includes('while this page is open'));
        assert.deepEqual(errors, []);
        console.log('PASS: mobile layouts and answer checking work with storage blocked; no script injection or errors.');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
