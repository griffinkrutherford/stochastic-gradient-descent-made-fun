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
        for(const [id,value,expected] of [['dim-ladder-dimension','0','1 corner'],['dim-ladder-dimension','4','16 corners'],['dim-slice-slice','0.6','0.80'],['dim-slice-slice','1.2','no disk exists'],['dim-hypersphere-slice','0.6','0.80'],['dim-escape-progress','1','back on the sheet']]){
            await page.locator('#'+id).fill(value);
            const kind=id.split('-')[1];await page.locator(`#dim-${kind}-canvas`).scrollIntoViewIfNeeded();
            await page.waitForFunction(({kind,expected})=>document.getElementById(`dim-${kind}-summary`).textContent.includes(expected),{kind,expected});
        }
        await page.locator('#dim-tesseract-angle').fill('0');await page.locator('#dim-tesseract-projection').selectOption('orthographic');
        await page.locator('#dim-tesseract-canvas').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.getElementById('dim-tesseract-summary').textContent.includes('discards w'));
        await page.locator('#dim-features').getByRole('button',{name:'Reset all six coordinates'}).click();
        await page.locator('#dim-features-feature-2').fill('1');await page.waitForFunction(()=>document.getElementById('dim-features-summary').textContent.includes('points overlap'));
        // The revealing experiments must change actual coordinates, not just explanatory captions.
        await page.locator('#dim-ladder').getByRole('button',{name:'Start with overlapping copies'}).click();
        await page.waitForFunction(()=>document.getElementById('dim-ladder-summary').textContent.includes('coincide geometrically'));
        assert.equal(await page.locator('#dim-ladder-growth').inputValue(),'0');
        await page.locator('#dim-ladder').getByRole('button',{name:'Pull them into a tesseract'}).click();
        assert.equal(await page.locator('#dim-ladder-growth').inputValue(),'1');
        await page.locator('#dim-tesseract').getByRole('button',{name:'Watch a quarter-turn'}).click();
        await page.waitForFunction(()=>document.getElementById('dim-tesseract-summary').textContent.includes('(-1.00, 1.00, 1.00, 1.00)'));
        assert((await page.locator('#dim-tesseract-summary').textContent()).includes('2.00 to 2.00'));
        await page.locator('#dim-hypersphere').getByRole('button',{name:'Radius 0.8; volume 0.512'}).click();
        await page.waitForFunction(()=>document.getElementById('dim-hypersphere-summary').textContent.includes('51.2%'));
        await page.locator('#dim-features').getByRole('button',{name:'Try six nonzero coordinates'}).click();
        await page.locator('#dim-features').getByRole('button',{name:'Move every knob 25% toward the reference'}).click();
        assert(Math.abs(Number(await page.locator('#dim-features-feature-0').inputValue())-.525)<1e-12);
        await page.locator('#dim-features').getByRole('button',{name:'Hide a crunch-only difference'}).click();
        await page.locator('#dim-features').getByRole('button',{name:'Move every knob 25% toward the reference'}).click();
        await page.waitForFunction(()=>document.querySelector('.dim-budget-total').textContent.includes('Last step: 0.5000 → 0.2813'));
        assert((await page.locator('#dim-features-summary').textContent()).includes('points overlap'));
        await page.locator('#dim-features-x').selectOption('2');await page.locator('#dim-features-y').selectOption('2');
        await page.waitForFunction(()=>document.querySelector('.dim-budget-total').textContent.includes('hidden contribution 0.00'));
        await page.locator('#dim-tesseract .dim-prediction button').first().click();
        assert((await page.locator('#dim-tesseract-prediction-feedback').textContent()).includes('Compare that prediction'));
        await page.locator('#dim-tesseract .dim-prediction button').last().click();
        assert((await page.locator('#dim-tesseract-prediction-feedback').textContent()).includes('That follows from the geometry'));
        for(const [value,text] of [['3','72.9%'],['100','0.0027%']]) {
            await page.locator('#dim-volume-dimension').fill(value);assert((await page.locator('#dim-volume-summary').textContent()).includes(text));
        }
        await page.locator('#dim-volume').screenshot({path:path.join(out,'dimensions-volume-100.png')});
        await page.locator('#dim-volume-dimension').fill('3');await page.locator('#dim-volume').screenshot({path:path.join(out,'dimensions-volume-3.png')});
        await page.locator('#dim-volume-dimension').fill('10');await page.locator('#dim-volume').screenshot({path:path.join(out,'dimensions-volume-10.png')});
        await page.locator('#dim-escape').getByRole('button',{name:'Pause above the ink crossing'}).click();
        assert(Math.abs(Number(await page.locator('#dim-escape-progress').inputValue())-(.3+.4*.85/1.8))<1e-12);
        await page.setViewportSize({width:390,height:844});await page.locator('#dim-volume').screenshot({path:path.join(out,'dimensions-volume-phone.png')});
        for(const kind of ['ladder','slice','shadow','tesseract','net','hypersphere','features','escape']) {
            await page.locator(`#dim-${kind} .dim-reasoning summary`).click();
            assert(await page.locator(`#dim-${kind} .dim-reasoning`).evaluate(el=>el.open));
            await page.locator(`#dim-${kind}`).screenshot({path:path.join(out,`dimensions-${kind}-reasoning-phone.png`)});
            await page.locator(`#dim-${kind} .dim-reasoning summary`).click();
        }
        await page.setViewportSize({width:1440,height:1100});
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
        const orbit=page.locator('#dim-tesseract [data-dim-action="orbit"]');if(await orbit.getAttribute('aria-pressed')==='false')await orbit.click();
        await page.locator('#shared-animations-toggle').click();await animated.scrollIntoViewIfNeeded();await page.waitForTimeout(100);
        const moving=await animated.evaluate(e=>e.toDataURL());await page.waitForTimeout(180);assert((await animated.evaluate(e=>e.toDataURL()))!==moving,'global play rotates the enabled turntable');
        await page.locator('#shared-animations-toggle').click();await animated.scrollIntoViewIfNeeded();await page.waitForTimeout(80);
        const stopped=await animated.evaluate(e=>e.toDataURL());await page.waitForTimeout(180);assert.equal(await animated.evaluate(e=>e.toDataURL()),stopped);
        await page.emulateMedia({media:'print'});assert.equal(await page.locator('.dim-stage:visible').count(),0);assert(await page.locator('#dimensions-title').isVisible());
        assert.deepEqual(errors,[]);
        console.log('PASS: fifth-tab deep link, eight studios, known geometry, camera controls, pause/reduced motion, lesson round trips, mobile and print. 44 captures await manual aesthetics/interpretability grading.');
    } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
