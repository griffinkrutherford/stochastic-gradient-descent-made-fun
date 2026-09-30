const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
        const errors = []; page.on('pageerror', e => errors.push(e.message));
        await page.goto(process.env.WORKSHEET_URL || 'http://127.0.0.1:8775/', { waitUntil: 'load' });
        const output = process.env.VISUAL_REVIEW_DIR || '/tmp/worksheet-visual-review'; fs.mkdirSync(output, { recursive: true });
        const configurations = { algebra: ['bridge', 'terrain'], calculus: ['bridge', 'terrain'], statistics: ['skyline', 'fit'], modeling: ['market', 'fit'] };
        for (const [mode, kinds] of Object.entries(configurations)) {
            await page.locator(`label[for="mode-${mode}"]`).click();
            assert.equal(await page.locator('.visual-lab:visible').count(), 2);
            for (const kind of kinds) {
                const id = `lab-${mode}-${kind}`, scene = page.locator(`#${id}-canvas`).locator('..').locator('..');
                const canvas = page.locator(`#${id}-canvas`);
                await canvas.scrollIntoViewIfNeeded(); await page.waitForTimeout(120);
                assert.ok((await page.locator(`#${id}-summary`).textContent()).length > 80);
                // Reduced motion freezes both camera and decorative animation; controls still work.
                const frozen = await canvas.evaluate(el => el.toDataURL()); await page.waitForTimeout(100);
                assert.equal(await canvas.evaluate(el => el.toDataURL()), frozen);
                await canvas.focus(); await canvas.press('ArrowRight'); await page.waitForTimeout(80);
                assert.notEqual(await canvas.evaluate(el => el.toDataURL()), frozen);
                const shots = [
                    { name: 'perspective', keys: [] },
                    { name: 'reverse', keys: Array(20).fill('ArrowRight') },
                    { name: 'overhead', keys: Array(5).fill('ArrowUp') }
                ];
                for (const { name, keys } of shots) {
                    await canvas.focus(); await canvas.press('Home');
                    for (const key of keys) await canvas.press(key);
                    await page.waitForTimeout(100);
                    await scene.screenshot({ path: path.join(output, `${mode}-${kind}-${name}.png`) });
                }
                await page.setViewportSize({ width: 390, height: 844 });
                await canvas.scrollIntoViewIfNeeded(); await canvas.focus(); await canvas.press('Home'); await page.waitForTimeout(200);
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
                await scene.screenshot({ path: path.join(output, `${mode}-${kind}-phone.png`) });
                await page.setViewportSize({ width: 1440, height: 1100 });
            }
        }
        // Check displayed states against known values and linked controls, not just canvas presence.
        await page.locator('label[for="mode-algebra"]').click();
        await page.locator('#lab-algebra-bridge-x').fill('-1'); await page.locator('#lab-algebra-bridge-gap').fill('2');
        await page.locator('#lab-algebra-bridge-canvas').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.getElementById('lab-algebra-bridge-summary').textContent.includes('secant slope 0.00'));
        await page.locator('[data-lab-mode="algebra"] [data-lab-action="step"]').click();
        await page.waitForFunction(() => document.getElementById('lab-algebra-terrain-summary').textContent.includes('F = u² + v² = 10.76'));
        await page.locator('label[for="mode-calculus"]').click();
        await page.locator('#lab-calculus-bridge-gap').fill('0.05'); await page.locator('#lab-calculus-bridge-canvas').scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.getElementById('lab-calculus-bridge-summary').textContent.includes('difference is 0.05'));
        await page.locator('[data-lab-mode="calculus"] [data-lab-action="step"]').click();
        await page.waitForFunction(() => document.getElementById('lab-calculus-terrain-summary').textContent.includes('F = u² + v² = 6.37'));
        await page.locator('label[for="mode-statistics"]').click();
        // Scene ids are on canvases; use their containing section for action controls.
        await page.locator('#lab-statistics-skyline-canvas').locator('..').locator('..').locator('[data-lab-action="step"]').click();
        await page.waitForFunction(() => document.getElementById('lab-statistics-skyline-summary').textContent.includes('average 64.00'));
        await page.locator('#lab-statistics-fit-canvas').locator('..').locator('..').locator('[data-lab-action="step"]').click();
        assert.equal(await page.evaluate(() => getStatisticsLine().steps), 1);
        await page.locator('label[for="mode-modeling"]').click();
        await page.locator('#lab-modeling-market-capacity').fill('80'); assert.equal(await page.locator('#model-capacity').inputValue(), '80');
        await page.locator('#lab-modeling-market-price').fill('4.75'); assert.equal(await page.locator('#model-price').inputValue(), '4.75');
        await page.locator('#lab-modeling-fit-canvas').locator('..').locator('..').locator('[data-lab-action="step"]').click();
        assert.equal(await page.evaluate(() => getModelingLine().steps), 1);
        const active = page.locator('#lab-modeling-fit-canvas');
        await page.locator('#shared-animations-toggle').click(); await active.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100); const moving = await active.evaluate(el => el.toDataURL());
        await page.waitForTimeout(200); assert.notEqual(await active.evaluate(el => el.toDataURL()), moving);
        await page.locator('#shared-animations-toggle').click(); await active.scrollIntoViewIfNeeded();
        await page.waitForTimeout(100); const stopped = await active.evaluate(el => el.toDataURL());
        await page.waitForTimeout(200); assert.equal(await active.evaluate(el => el.toDataURL()), stopped);
        await page.emulateMedia({ media: 'print' });
        assert.equal(await page.locator('.visual-lab:visible').count(), 0);
        assert.equal(await page.locator('.container').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
        await page.emulateMedia({ media: 'screen' });
        assert.deepEqual(errors, []);
        console.log(`PASS: eight live 3D labs, mathematical states, linked fitting/planning controls, keyboard cameras, reduced motion, phone widths; 32 screenshots saved to ${output}.`);
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
