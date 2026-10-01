// Same four-view review workflow as visual-labs.browser.cjs; scores require inspection.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
    const browser = await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
    try {
        const page = await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
        const errors=[];page.on('pageerror',e=>errors.push(e.message));
        const url=new URL(process.env.WORKSHEET_URL||'http://127.0.0.1:8000/');url.searchParams.set('version','dimensions');
        await page.goto(url.href,{waitUntil:'load'});
        assert.equal(await page.locator('#mode-dimensions').isChecked(),true);
        assert.equal(await page.locator('.worksheet-panel:visible').count(),1);
        assert.equal(await page.locator('.dim-card').count(),8);
        assert(!/Santa Fe Prep|Prep Pop-Up/.test(await page.locator('#modeling-worksheet').textContent()));
        const out=process.env.VISUAL_REVIEW_DIR||'/tmp/worksheet-visual-review';fs.mkdirSync(out,{recursive:true});
        for(const kind of ['ladder','slice','shadow','tesseract','net','hypersphere','features','escape']) {
            const card=page.locator(`#dim-${kind}`),canvas=card.locator('canvas');
            await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(120);
            assert((await card.locator('.dim-summary').textContent()).length>80);
            const initial=await canvas.evaluate(e=>e.toDataURL());await page.waitForTimeout(120);
            assert.equal(await canvas.evaluate(e=>e.toDataURL()),initial,'reduced motion freezes '+kind);
            if(kind!=='features') {await canvas.focus();await canvas.press('ArrowRight');await page.waitForTimeout(80);assert.notEqual(await canvas.evaluate(e=>e.toDataURL()),initial);}
            const views=kind==='features'?['reference','hidden','mixed']:['perspective','reverse','overhead'];
            for(const view of views) {
                if(kind==='features') {
                    for(let i=0;i<6;i++) await page.locator(`#dim-features-feature-${i}`).fill(String(view==='reference'?0:view==='hidden'?(i===2?1:0):[.7,-.4,.8,.2,.5,-.6][i]));
                } else {
                    await canvas.focus();await canvas.press('Home');
                    const keys=view==='reverse'?Array(24).fill('ArrowRight'):view==='overhead'?Array(7).fill('ArrowUp'):[];
                    for(const key of keys)await canvas.press(key);
                }
                await page.waitForTimeout(80);await card.screenshot({path:path.join(out,`dimensions-${kind}-${view}.png`)});
            }
            await page.setViewportSize({width:390,height:844});await canvas.scrollIntoViewIfNeeded();
            if(kind!=='features'){await canvas.focus();await canvas.press('Home');}
            await page.waitForTimeout(150);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
            await card.screenshot({path:path.join(out,`dimensions-${kind}-phone.png`)});
            await page.setViewportSize({width:1440,height:1100});
        }
        for(const [id,value,expected] of [['dim-ladder-dimension','0','1 corner'],['dim-ladder-dimension','4','16 corners'],['dim-slice-slice','.6','0.80'],['dim-slice-slice','1.2','no disk exists'],['dim-hypersphere-slice','.6','0.80'],['dim-escape-progress','1','back on the sheet']]){
            await page.locator('#'+id).fill(value);
            const kind=id.split('-')[1];await page.locator(`#dim-${kind}-canvas`).scrollIntoViewIfNeeded();
            await page.waitForFunction(({kind,expected})=>document.getElementById(`dim-${kind}-summary`).textContent.includes(expected),{kind,expected});
        }
        await page.locator('#dim-tesseract-angle').fill('0');await page.locator('#dim-tesseract-projection').selectOption('orthographic');
        await page.locator('#dim-tesseract-canvas').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.getElementById('dim-tesseract-summary').textContent.includes('discards w'));
        await page.locator('#dim-features').getByRole('button',{name:'Reset all six coordinates'}).click();
        await page.locator('#dim-features-feature-2').fill('1');await page.waitForFunction(()=>document.getElementById('dim-features-summary').textContent.includes('points overlap'));
        // Returning from the bonus must preserve lesson drafts and shared widget identities.
        await page.locator('label[for="mode-algebra"]').click();await page.locator('#practice-input-1').fill('preserve my draft');
        for(const version of ['dimensions','statistics','modeling','dimensions','algebra']) {
            await page.locator(`label[for="mode-${version}"]`).click();assert.equal(await page.locator('.worksheet-panel:visible').count(),1);
            for(const id of ['sgdCanvas','wordVectorCanvas','wordConvergenceCanvas'])assert.equal(await page.locator('#'+id).count(),1);
        }
        assert.equal(await page.locator('#practice-input-1').inputValue(),'preserve my draft');
        await page.locator('#mode-modeling').focus();await page.keyboard.press('ArrowRight');assert(await page.locator('#mode-dimensions').isChecked());
        for(const width of [1440,768,390,320]) {await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow at '+width);}
        await page.setViewportSize({width:1440,height:1100});const animated=page.locator('#dim-tesseract-canvas');await animated.scrollIntoViewIfNeeded();
        await page.locator('#shared-animations-toggle').click();await animated.scrollIntoViewIfNeeded();await page.waitForTimeout(100);
        const moving=await animated.evaluate(e=>e.toDataURL());await page.waitForTimeout(180);assert.notEqual(await animated.evaluate(e=>e.toDataURL()),moving);
        await page.locator('#shared-animations-toggle').click();await animated.scrollIntoViewIfNeeded();await page.waitForTimeout(80);
        const stopped=await animated.evaluate(e=>e.toDataURL());await page.waitForTimeout(180);assert.equal(await animated.evaluate(e=>e.toDataURL()),stopped);
        await page.emulateMedia({media:'print'});assert.equal(await page.locator('.dim-stage:visible').count(),0);assert(await page.locator('#dimensions-title').isVisible());
        assert.deepEqual(errors,[]);
        console.log('PASS: fifth-tab deep link, eight studios, known geometry, camera controls, pause/reduced motion, lesson round trips, mobile and print. 32 captures await manual aesthetics/interpretability grading.');
    } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
