// Serve the worksheet and set WORKSHEET_URL, NODE_PATH, and optionally CHROME_PATH.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    try {
        const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
        const page = await context.newPage(), errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const url = new URL(process.env.WORKSHEET_URL || 'http://127.0.0.1:8765/'); url.searchParams.set('version', 'modeling');
        await page.goto(url.href, { waitUntil: 'load' });
        assert.equal(await page.locator('#mode-modeling').isChecked(), true);
        assert.ok(await page.locator('#modeling-worksheet').isVisible());
        assert.equal(await page.locator('#model-pilots tbody tr').count(), 7);
        assert.equal(await page.locator('#original-worksheet').isVisible(), false);
        assert.equal(await page.locator('#statistics-worksheet').isVisible(), false);
        assert.equal(await page.locator('#shared-animations-toggle').getAttribute('aria-pressed'), 'true');
        const css = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--worksheet-accent').trim());
        assert.equal(css, '#61c7ff');
        for (const [key, value] of Object.entries({ slope: '-12', residual: '2', profit: '120', growth: '58.6', angle: '53.1' })) {
            await page.locator(`#model-answer-${key}`).fill(value);
            await page.locator(`#model-answer-${key}`).press('Enter');
            assert.equal(await page.locator(`#model-feedback-${key}`).getAttribute('data-result'), 'correct');
        }
        await page.locator('#model-answer-profit').fill('200'); await page.locator('[data-model-check="profit"]').click();
        assert.equal(await page.locator('#model-feedback-profit').getAttribute('data-result'), 'incorrect');
        await page.locator('#model-step').click();
        assert.equal(await page.locator('.model-selected').count(), 3);
        const first = await page.locator('#model-step-summary').textContent();
        assert.match(first, /Update 1/);
        await page.locator('#model-reset').click(); await page.locator('#model-step').click();
        assert.equal(await page.locator('#model-step-summary').textContent(), first);
        await page.locator('#model-sequence').click(); await page.locator('#model-step').click();
        assert.notEqual(await page.locator('#model-step-summary').textContent(), first);
        await page.locator('#model-reset').click(); await page.locator('#model-batch').selectOption('7');
        for (let i = 0; i < 80; i++) await page.locator('#model-step').click();
        assert.match(await page.locator('#model-fit-summary').textContent(), /q = 100.00 − 12.00p/);
        assert.match(await page.locator('#model-fit-summary').textContent(), /80 updates; 560 pilot observations/);
        await page.locator('#model-use-reference').click();
        assert.match(await page.locator('#model-plan-summary').textContent(), /\$5.00 with \$120.00/);
        assert.match(await page.locator('#model-budget').textContent(), /\$200.00.*\$80.00.*\$120.00/s);
        await page.locator('#model-capacity').fill('80');
        assert.match(await page.locator('#model-plan-summary').textContent(), /\$4.75/);
        await page.locator('#model-validate').click();
        assert.match(await page.locator('#model-validation-summary').textContent(), /error 2.00/);
        await page.locator('#model-validation-day').selectOption('rainy');
        assert.match(await page.locator('#model-validation-summary').textContent(), /error 262.33/);
        assert.equal(await page.locator('#model-pilots tbody tr').count(), 7);
        await page.locator('#model-response-pitch').fill('Charge $5 for $120 profit per hour, with capacity 40 cups. Check rainy weather and affordable access.');
        await page.locator('#model-response-pitch').press('Control+Enter');
        assert.match(await page.locator('#model-feedback-pitch').textContent(), /does not grade/);
        await page.reload({ waitUntil: 'load' });
        assert.match(await page.locator('#model-response-pitch').inputValue(), /Charge \$5/);
        await page.locator('#model-run').click();
        await page.waitForFunction(() => document.getElementById('model-step-summary').textContent.includes('Update 1'));
        await page.locator('#model-run').click();
        const paused = await page.locator('#model-step-summary').textContent(); await page.waitForTimeout(350);
        assert.equal(await page.locator('#model-step-summary').textContent(), paused);
        await page.locator('#model-run').click(); await page.locator('label[for="mode-statistics"]').click();
        const exitState = await page.locator('#model-step-summary').textContent(); await page.waitForTimeout(350);
        assert.equal(await page.locator('#model-step-summary').textContent(), exitState);
        await page.locator('#mode-statistics').focus(); await page.keyboard.press('ArrowRight');
        assert.ok(await page.locator('#modeling-worksheet').isVisible());
        for (const width of [1440, 390, 320]) {
            await page.setViewportSize({ width, height: 900 });
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
        }
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.screenshot({ path: '/tmp/modeling-desktop.png', fullPage: false });
        await page.locator('#model-fit-chart').scrollIntoViewIfNeeded();
        await page.screenshot({ path: '/tmp/modeling-fit.png' });
        await page.setViewportSize({ width: 390, height: 844 }); await page.locator('#modeling-title').scrollIntoViewIfNeeded();
        await page.screenshot({ path: '/tmp/modeling-phone.png' });
        assert.deepEqual(errors, []);
        console.log('PASS: Modeling deep link, calculations, reproducible fitting, convergence, capacity, validation, drafts, keyboard controls, pause, and phone widths.');
        const blocked = await browser.newContext();
        await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Blocked'); } }); });
        const blockedPage = await blocked.newPage(); await blockedPage.goto(url.href);
        await blockedPage.locator('#model-response-frame').fill('Choose a price.');
        assert.match(await blockedPage.locator('#model-save-status').textContent(), /unavailable/);
        assert.ok(await blockedPage.locator('#model-step').isEnabled());
        await blocked.close();
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
