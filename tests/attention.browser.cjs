/* Visual scores are assigned after inspection, never by this capture script. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
    const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
    try {
        const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
        const errors=[];page.on('pageerror',e=>errors.push(e.message));
        const url=new URL(process.env.WORKSHEET_URL||'http://127.0.0.1:8790/');url.searchParams.set('version','attention');
        await page.goto(url.href,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
        assert(await page.locator('#mode-attention').isChecked());assert.equal(await page.locator('.worksheet-panel:visible').count(),1);assert.equal(await page.locator('.att-card').count(),8);
        const out=process.env.VISUAL_REVIEW_DIR||'/tmp/attention-review';fs.mkdirSync(out,{recursive:true});
        const kinds=['language','objective','ranking','outrage','surprise','stopping','exposure','redesign'];
        const state=async kind=>{await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));return page.locator(`#att-${kind}-summary`).textContent();};
        const waitText=(kind,text)=>page.waitForFunction(({kind,text})=>document.getElementById(`att-${kind}-summary`).textContent.includes(text),{kind,text});
        const click=(kind,action)=>page.locator(`#att-${kind}-${action}`).click();
        await waitText('language','Settings (0.000, 0.000)');
        await click('language','step');await waitText('language','1 updates · 10 examples processed');
        assert((await state('language')).includes('Settings (0.160, -0.020)'));assert.equal(await page.locator('#att-language [data-att-row].is-selected').count(),10);
        await click('language','reset');await page.locator('#att-language-batch').selectOption('1');
        await click('language','step');const replay=await state('language');await click('language','reset');await click('language','step');assert.equal(await state('language'),replay);assert.equal(await page.locator('#att-language [data-att-row].is-selected').count(),1);
        await page.locator('#att-language-batch').selectOption('10');await click('language','reset');for(let i=0;i<20;i++)await click('language','step');
        await page.locator('#att-objective-weight').fill('0.5');for(let i=0;i<6;i++)await click('objective','step');
        await click('outrage','run');await waitText('outrage','60 feedback cycles');await click('surprise','run');await waitText('surprise','12/12 cards');
        const initialExposure=await state('exposure');await click('exposure','fit');await waitText('exposure','Predictions (0.4000, 0.7500)');assert((await state('exposure')).includes('0/0'));
        await click('exposure','reset');assert.equal(await state('exposure'),initialExposure);
        // Original state comparisons, three camera angles, and full phone cards.
        for(const kind of kinds){
            const card=page.locator('#att-'+kind),canvas=card.locator('canvas');await canvas.scrollIntoViewIfNeeded();await page.waitForTimeout(120);
            const frozen=await canvas.evaluate(el=>el.toDataURL());await page.waitForTimeout(120);assert.equal(await canvas.evaluate(el=>el.toDataURL()),frozen,'reduced motion freezes '+kind);
            for(const view of ['perspective','reverse','overhead']){
                await canvas.focus();await canvas.press('Home');if(view==='reverse')for(let i=0;i<24;i++)await canvas.press('ArrowRight');if(view==='overhead')for(let i=0;i<7;i++)await canvas.press('ArrowUp');
                await page.waitForTimeout(90);await card.screenshot({path:path.join(out,`attention-${kind}-${view}.png`)});await canvas.screenshot({path:path.join(out,`canvas-attention-${kind}-${view}.png`)});
            }
            await page.setViewportSize({width:390,height:844});await canvas.scrollIntoViewIfNeeded();await canvas.focus();await canvas.press('Home');await page.waitForTimeout(120);
            assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await card.screenshot({path:path.join(out,`attention-${kind}-phone.png`)});await canvas.screenshot({path:path.join(out,`canvas-attention-${kind}-phone.png`)});
            await page.setViewportSize({width:1440,height:1100});
        }
        // Revealing experiments must alter computed states and actual plots.
        await click('language','fit');await waitText('language','200 updates');assert((await state('language')).includes('Reference optimum probabilities: 60%, 30%, 10%'));
        await page.locator('#att-language').screenshot({path:path.join(out,'attention-language-fit.png')});
        await click('objective','reflection');await waitText('objective','weighted optimum (-0.500, -0.300)');await page.locator('#att-objective').screenshot({path:path.join(out,'attention-objective-reflection.png')});
        await click('ranking','comments-heavy');await waitText('ranking','Top three: Sock war');await click('ranking','reflective');await waitText('ranking','Top three: Trail tip');await page.locator('#att-ranking').screenshot({path:path.join(out,'attention-ranking-reflection.png')});
        await page.locator('#att-outrage-norm').fill('0');await click('outrage','reset');await click('outrage','run');await waitText('outrage','60 feedback cycles');await page.locator('#att-outrage').screenshot({path:path.join(out,'attention-outrage-neutral.png')});
        await click('surprise','reset');await waitText('surprise','0/12 cards');await page.locator('#att-surprise').screenshot({path:path.join(out,'attention-surprise-unrevealed.png')});
        await click('stopping','no-friction');await waitText('stopping','10.46 without checkpoints; 10.46 with them');await page.locator('#att-stopping').screenshot({path:path.join(out,'attention-stopping-no-friction.png')});
        await click('exposure','balanced');await waitText('exposure','/10');await click('exposure','fit');assert(!(await state('exposure')).includes('quiet: 0/0'));await page.locator('#att-exposure').screenshot({path:path.join(out,'attention-exposure-balanced.png')});
        await click('redesign','search');await waitText('redesign','Grid search applied');assert.equal(await page.locator('#att-redesign-reflection').inputValue(),'0.8');await page.locator('#att-redesign').screenshot({path:path.join(out,'attention-redesign-best.png')});
        await page.locator('#att-language .att-prediction button').last().click();assert((await page.locator('#att-language .att-feedback').textContent()).includes('Compare that prediction'));
        await page.locator('#att-language .att-prediction button').first().click();assert((await page.locator('#att-language .att-feedback').textContent()).includes('That follows from the model'));
        await page.setViewportSize({width:390,height:844});
        for(const kind of kinds){await page.locator(`#att-${kind} .att-reasoning summary`).click();await page.locator('#att-'+kind).screenshot({path:path.join(out,`attention-${kind}-reasoning-phone.png`)});await page.locator(`#att-${kind} .att-reasoning`).screenshot({path:path.join(out,`detail-attention-${kind}.png`)});await page.locator(`#att-${kind} .att-reasoning summary`).click();}
        for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'layout width '+width);}
        // A sixth lesson must preserve all earlier drafts and widget identities.
        await page.locator('#att-exit-response').fill('A proxy can miss the reason for a comment.');
        await page.locator('label[for="mode-algebra"]').click();await page.locator('#practice-input-1').fill('preserve this original draft');
        for(const mode of ['statistics','modeling','dimensions','attention','calculus','algebra']){await page.locator(`label[for="mode-${mode}"]`).click();assert.equal(await page.locator('.worksheet-panel:visible').count(),1);}
        assert.equal(await page.locator('#practice-input-1').inputValue(),'preserve this original draft');
        await page.locator('label[for="mode-attention"]').click();assert.equal(await page.locator('#att-exit-response').inputValue(),'A proxy can miss the reason for a comment.');
        const canvas=page.locator('#att-outrage-canvas');await canvas.scrollIntoViewIfNeeded();await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(150);
        const moving=await canvas.evaluate(el=>el.toDataURL());await page.waitForTimeout(150);assert((await canvas.evaluate(el=>el.toDataURL()))!==moving,'turntable plays');
        await page.locator('#shared-animations-toggle').click();await page.waitForTimeout(150);const paused=await canvas.evaluate(el=>el.toDataURL());await page.waitForTimeout(150);assert.equal(await canvas.evaluate(el=>el.toDataURL()),paused,'global pause freezes scene');
        await click('outrage','step');await waitText('outrage','61 feedback cycles');
        await page.evaluate(()=>dispatchEvent(new Event('beforeprint')));assert(await page.locator('#att-language .att-reasoning').evaluate(el=>el.open));await page.emulateMedia({media:'print'});assert.equal(await page.locator('#att-language-canvas').isVisible(),false);
        await page.emulateMedia({media:'screen'});await page.evaluate(()=>dispatchEvent(new Event('afterprint')));assert(!(await page.locator('#att-language .att-reasoning').evaluate(el=>el.open)));
        await page.reload();assert.equal(await page.locator('#att-exit-response').inputValue(),'A proxy can miss the reason for a comment.');assert.deepEqual(errors,[]);
        // Storage failure should not prevent the lesson from loading or taking steps.
        const blocked=await browser.newPage();await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage blocked');}});});await blocked.goto(url.href);await blocked.locator('#att-language-step').click();await blocked.waitForFunction(()=>document.getElementById('att-language-summary').textContent.includes('1 updates'));assert((await blocked.locator('#att-language-summary').textContent()).includes('1 updates'));await blocked.close();
        console.log('PASS: six tabs, computed updates/rankings, seeded replay, missing-data fit, 121-design search, feedback, drafts/storage failure, cameras, motion, phone and print. 48 captures require manual visual grading.');
    }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
