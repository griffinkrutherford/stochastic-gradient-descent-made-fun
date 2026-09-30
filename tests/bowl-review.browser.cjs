const { chromium }=require('playwright'); const fs=require('node:fs');
(async()=>{const b=await chromium.launch({headless:true,...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});try{
const p=await b.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});await p.goto(process.env.WORKSHEET_URL||'http://127.0.0.1:8775/',{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);
const out=process.env.VISUAL_REVIEW_DIR||'/tmp/worksheet-visual-review';fs.mkdirSync(out,{recursive:true});
await p.locator('#shared-animations-toggle').click(); await p.waitForTimeout(3200);await p.locator('#shared-animations-toggle').click();
for(const mode of ['algebra','calculus','statistics','modeling']){
await p.locator(`label[for="mode-${mode}"]`).click(); const c=p.locator('#sgdCanvas');
for(const [name,keys] of [['perspective',[]],['reverse',Array(18).fill('ArrowRight')],['overhead',Array(6).fill('ArrowUp')]]){
await c.scrollIntoViewIfNeeded();await c.focus();await c.press('Home');for(const key of keys)await c.press(key);await p.waitForTimeout(100);await p.locator('#shared-marble-bowl').screenshot({path:`${out}/${mode}-shared-bowl-${name}.png`});}
await p.setViewportSize({width:390,height:844});await c.scrollIntoViewIfNeeded();await c.focus();await c.press('Home');await p.waitForTimeout(100);await p.locator('#shared-marble-bowl').screenshot({path:`${out}/${mode}-shared-bowl-phone.png`});await p.setViewportSize({width:1440,height:1100});}
console.log('Captured 16 shared-bowl angle/theme/phone views.');}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
