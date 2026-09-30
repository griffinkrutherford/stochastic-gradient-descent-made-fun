// Serve the repo first. Requires Playwright; CHROME_PATH can select an installed browser.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
    const browser = await chromium.launch({
        headless: true,
        ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
    });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(process.env.WORKSHEET_URL || 'http://127.0.0.1:8000/', { waitUntil: 'load' });
        const selectMode = mode => page.locator(`label[for="mode-${mode}"]`).click();
        const snapshot = () => page.evaluate(() => ({
            marbles: sgdMarbles.map(marble => [marble.x, marble.y]),
            words: convLoopTimer,
            shape: bowlMorphFrame,
            output: outputFrame
        }));
        const canvasIds = ['sgdCanvas', 'wordVectorCanvas', 'wordConvergenceCanvas',
            'bowlMorphCanvas', 'outputWordCanvas', 'outputBowlCanvas', 'outputDistributionCanvas'];

        for (const mode of ['modeling', 'statistics', 'algebra', 'calculus', 'modeling', 'statistics', 'algebra', 'modeling']) {
            await selectMode(mode);
            for (const id of canvasIds) {
                const canvas = page.locator(`#${id}`);
                assert.equal(await canvas.count(), 1);
                assert.ok(await canvas.isVisible());
                assert.equal(await canvas.evaluate(element => element.closest('.worksheet-panel').id),
                    mode === 'modeling' ? 'modeling-worksheet' : mode === 'statistics' ? 'statistics-worksheet' : 'original-worksheet');
            }
            const caption = await page.locator('label[for="sgdNoise"]').textContent();
            assert.ok(caption.includes('illustration'));
        }
        console.log('PASS: seven shared canvases and original captions survive repeated mode changes.');

        let before = await snapshot();
        await page.waitForTimeout(200);
        const moving = await snapshot();
        for (const key of ['words', 'shape', 'output']) assert.ok(moving[key] > before[key]);
        assert.notDeepEqual(moving.marbles, before.marbles);

        await page.locator('#shared-animations-toggle').click();
        before = await snapshot();
        await page.waitForTimeout(200);
        assert.deepEqual(await snapshot(), before);
        await page.locator('#outputTemperature').fill('90');
        assert.ok((await page.locator('#outputTemperatureLabel').textContent()).includes('90'));
        await page.locator('#wordvec-theme-select').selectOption('arcane');
        assert.ok((await page.locator('#wordvec-display-title').textContent()).includes('Arcane'));
        await page.locator('#wordVectorTime').fill('33');
        assert.ok((await page.locator('#wordVectorTimeLabel').textContent()).includes('33'));
        console.log('PASS: animations play, pause freezes state, and paused controls remain usable.');

        await page.locator('#shared-animations-toggle').click();
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.waitForFunction(() =>
            document.getElementById('shared-animations-toggle').getAttribute('aria-pressed') === 'true');
        before = await snapshot();
        await page.waitForTimeout(200);
        assert.deepEqual(await snapshot(), before);
        console.log('PASS: reduced motion pauses the shared animations.');

        for (const width of [1440, 390, 320]) {
            await page.setViewportSize({ width, height: 900 });
            for (const mode of ['algebra', 'calculus', 'statistics', 'modeling']) {
                await selectMode(mode);
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                    `${mode} overflows at ${width}px`);
            }
        }
        assert.deepEqual(errors, []);
        console.log('PASS: all four modes fit desktop and phone widths without JavaScript errors.');
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
