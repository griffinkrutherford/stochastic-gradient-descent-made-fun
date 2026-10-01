const test=require('node:test');
const assert=require('node:assert/strict');
const C=require('../attention-core');
const near=(a,b,tolerance=1e-8)=>assert(Math.abs(a-b)<tolerance,`${a} != ${b}`);
test('language gradients match finite differences and full-data fitting reaches the known probabilities',()=>{
    const theta=[-.8,.4],g=C.languageGradient(theta),h=1e-5;
    for(let i=0;i<2;i++){const a=theta.slice(),b=theta.slice();a[i]+=h;b[i]-=h;near(g[i],(C.languageLoss(a)-C.languageLoss(b))/(2*h));}
    let fit=[-1,-.5];for(let i=0;i<1200;i++)fit=C.languageStep(fit,.6);
    C.softmax([...fit,0]).forEach((v,i)=>near(v,[.6,.3,.1][i],1e-6));
    near(C.languageGradient([Math.log(6),Math.log(3)])[0],0);
    assert(C.languageLoss(C.languageStep(theta,.6))<C.languageLoss(theta));
    assert(Number.isFinite(C.languageLoss([1000,-1000])));
});
test('seeded distinct mini-batches replay and a single-token step can raise full-data loss',()=>{
    const a=C.random(17),b=C.random(17);
    for(let i=0;i<20;i++){const ids=C.sample(4,10,a);assert.equal(new Set(ids).size,4);assert.deepEqual(ids,C.sample(4,10,b));}
    const optimum=[Math.log(6),Math.log(3)];assert(C.languageLoss(C.languageStep(optimum,.6,[2]))>C.languageLoss(optimum));
});
test('changing proxy weights moves the optimum; quarter steps reduce the weighted objective',()=>{
    assert.deepEqual(C.proxyTarget(0),[-.5,-.3]);assert.deepEqual(C.proxyTarget(1),[.8,.7]);
    C.proxyTarget(.5).forEach((v,i)=>near(v,[.15,.2][i]));
    const theta=[-.8,.8];for(const w of [0,.3,1])assert(C.proxyLoss(C.proxyStep(theta,w),w)<C.proxyLoss(theta,w));
});
test('candidate rankings use the actual scores and can disagree across objectives',()=>{
    assert.equal(C.rankClips(0,1)[0].name,'Sock war');assert.equal(C.rankClips(1)[0].name,'Trail tip');
    const ranked=C.rankClips(.4,.3);ranked.forEach(c=>near(c.score,.6*(.7*c.watch+.3*c.comments)+.4*c.reflection));
    assert(ranked.every((c,i)=>!i||ranked[i-1].score>=c.score));
});
test('equal-mean reward decks preserve totals while order changes constant-rate learning',()=>{
    const deck=C.rewardDeck(42);assert.deepEqual(deck,C.rewardDeck(42));near(deck.reduce((a,b)=>a+b)/12,.4);assert.equal(deck.filter(v=>v===1).length,3);
    near(C.rewardUpdate(.4,1).next,.55);near(C.rewardUpdate(.4,1).error,.6);
    const fit=values=>values.reduce((q,r)=>C.rewardUpdate(q,r).next,.4);
    assert(Math.abs(fit(deck)-fit(deck.slice().reverse()))>.0001);
});
test('social feedback updates only the selected type and all seeded expectations stay bounded',()=>{
    let state={creator:[.5,.5],ranker:[.5,.5]},copy={creator:[.5,.5],ranker:[.5,.5]},rng=C.random(7),other=C.random(7);
    for(let i=0;i<80;i++){const next=C.socialStep(state,1,rng);assert.deepEqual(next,C.socialStep(copy,1,other));near(next.creator[1-next.selected],state.creator[1-next.selected]);assert(next.creator.every(v=>v>=0&&v<=1));state=next;copy=next;}
});
test('reach probabilities multiply actual transitions; zero friction makes both lanes identical',()=>{
    const base=C.survival(.15,0,false),zero=C.survival(.15,0,true),pause=C.survival(.15,.7,true);
    assert.deepEqual(base,zero);assert.equal(base.values[0],1);near(base.expected,base.values.reduce((a,b)=>a+b));assert(pause.expected<base.expected);
    for(let i=0;i<5;i++)near(base.values[i],pause.values[i]);assert(pause.values[5]<base.values[5]);
    assert(C.survival(.3,.7,true).expected<C.survival(.1,.7,true).expected);
});
test('missing exposure leaves a truly flat direction; collecting data gives it curvature',()=>{
    const counts=[{n:0,y:0},{n:8,y:6}],theta=[.4,.7];assert.equal(C.exposureGradient(theta,counts)[0],0);near(C.exposureLoss([.1,.7],counts),C.exposureLoss([.9,.7],counts));
    const collected=C.collectExposure(theta,counts,C.random(42),true);assert.equal(collected[0].n,10);assert.equal(collected[1].n,18);assert.deepEqual(counts,[{n:0,y:0},{n:8,y:6}]);
    const h=1e-5,g=C.exposureGradient(theta,collected);for(let i=0;i<2;i++){const a=theta.slice(),b=theta.slice();a[i]+=h;b[i]-=h;near(g[i],(C.exposureLoss(a,collected)-C.exposureLoss(b,collected))/(2*h));}
});
test('finite design search considers all 121 settings and respects its own objective',()=>{
    for(const budget of [4,6,12]){const best=C.bestDesign(budget);for(let i=0;i<=10;i++)for(let j=0;j<=10;j++)assert(best.loss<=C.designStats(i/10,j/10,budget).loss+1e-12);assert(best.loss<=C.designStats(0,0,budget).loss);near(best.loss,C.designStats(best.reflection,best.friction,budget).loss);}
});
