/* Transparent teaching models. None of these numbers are fitted to a person or platform. */
(function (root, factory) {
    const core = factory();
    if (typeof module === 'object' && module.exports) module.exports = core;
    else root.AttentionCore = core;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const clamp = (x,a,b) => Math.max(a,Math.min(b,x));
    function random(seed=42) {
        let state=seed>>>0;
        return () => { state=(state+0x6D2B79F5)>>>0;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296; };
    }
    function sample(size,n,rng) {
        const ids=Array.from({length:n},(_,i)=>i);
        for(let i=0;i<size;i++){const j=i+Math.floor(rng()*(n-i));[ids[i],ids[j]]=[ids[j],ids[i]];}
        return ids.slice(0,size);
    }
    function softmax(values,temperature=1) {
        if (!(temperature>0)) throw new RangeError('Temperature must be positive.');
        const max=Math.max(...values),exp=values.map(v=>Math.exp((v-max)/temperature)),sum=exp.reduce((a,b)=>a+b,0);
        return exp.map(v=>v/sum);
    }
    const tokens=['steep','quiet','muddy'], tokenRows=[0,0,0,0,0,0,1,1,1,2];
    function languageLoss(theta,rows=tokenRows) {
        const logits=[theta[0],theta[1],0],max=Math.max(...logits);
        const logZ=max+Math.log(logits.reduce((sum,v)=>sum+Math.exp(v-max),0));
        return rows.reduce((sum,label)=>sum+logZ-logits[label],0)/rows.length;
    }
    function languageGradient(theta,rows=tokenRows) {
        const p=softmax([theta[0],theta[1],0]),freq=[0,0,0];rows.forEach(i=>freq[i]+=1/rows.length);
        return [p[0]-freq[0],p[1]-freq[1]];
    }
    function languageStep(theta,rate,rows=tokenRows) {const g=languageGradient(theta,rows);return theta.map((v,i)=>v-rate*g[i]);}
    const targets={engagement:[.8,.7],reflection:[-.5,-.3]};
    function proxyTarget(weight) {return targets.engagement.map((v,i)=>weight*v+(1-weight)*targets.reflection[i]);}
    function proxyLoss(theta,weight) {return .5*theta.reduce((sum,v,i)=>sum+weight*(v-targets.engagement[i])**2+(1-weight)*(v-targets.reflection[i])**2,0);}
    function proxyStep(theta,weight,rate=.25) {const target=proxyTarget(weight);return theta.map((v,i)=>v+rate*(target[i]-v));}
    const clips=[
        {name:'Trail tip',detail:'One practical trail trick',watch:.50,comments:.12,reflection:.90,color:'#72e6ce'},
        {name:'Goat glitch',detail:'A goat steals the quiz',watch:.85,comments:.30,reflection:.65,color:'#b7a0ff'},
        {name:'Sock war',detail:'Boots vs. sneakers: the argument',watch:.95,comments:.95,reflection:.20,color:'#ff967f'},
        {name:'Clay loop',detail:'A satisfying pottery loop',watch:.65,comments:.20,reflection:.85,color:'#72d6ff'},
        {name:'Part 2?',detail:'An answer always one clip away',watch:.88,comments:.50,reflection:.35,color:'#ffd481'},
        {name:'Quiet stars',detail:'A calm night-sky moment',watch:.30,comments:.05,reflection:.80,color:'#d0ed9d'}
    ];
    function engagement(clip,comments=.3) {return (1-comments)*clip.watch+comments*clip.comments;}
    function rankClips(reflection=0,comments=.3) {return clips.map((clip,index)=>({...clip,index,score:(1-reflection)*engagement(clip,comments)+reflection*clip.reflection})).sort((a,b)=>b.score-a.score||a.index-b.index);}
    function rewardUpdate(expected,reward,rate=.25) {return {error:reward-expected,next:expected+rate*(reward-expected)};}
    function rewardDeck(seed=42) {
        const values=[1,1,1,...Array(9).fill(.2)],rng=random(seed);
        for(let i=values.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[values[i],values[j]]=[values[j],values[i]];}
        return values;
    }
    function socialStep(state,norm,rng) {
        const probabilities=softmax(state.creator.map((v,i)=>v+state.ranker[i]),.35);
        const selected=rng()<probabilities[1]?1:0;
        const reward=clamp(.55+(selected?norm*.35:0)+(rng()-.5)*.1,0,1);
        const creator=state.creator.slice(),ranker=state.ranker.slice();
        creator[selected]=rewardUpdate(creator[selected],reward,.3).next;
        ranker[selected]=rewardUpdate(ranker[selected],reward,.25).next;
        return {creator,ranker,selected,reward,probabilities};
    }
    function survival(cost=.15,friction=.5,checkpoints=true,n=20) {
        let reach=1;const values=[1];
        for(let i=1;i<n;i++) {
            const pause=checkpoints&&i%5===0?friction:0;
            const p=1/(1+Math.exp(-(1+6*(.4-cost-pause))));
            reach*=p;values.push(reach);
        }
        return {values,expected:values.reduce((a,b)=>a+b,0)};
    }
    function exposureLoss(theta,counts) {
        const total=counts.reduce((sum,c)=>sum+c.n,0);
        if(!total)return 0;
        return counts.reduce((sum,c,i)=>sum+c.n*(theta[i]-(c.n?c.y/c.n:0))**2,0)/(2*total);
    }
    function exposureGradient(theta,counts) {
        const total=counts.reduce((sum,c)=>sum+c.n,0);
        return counts.map((c,i)=>total&&c.n?c.n/total*(theta[i]-c.y/c.n):0);
    }
    function collectExposure(theta,counts,rng,balanced=false) {
        const next=counts.map(c=>({...c}));
        const truth=[.65,.75];
        for(let i=0;i<(balanced?20:10);i++) {
            const group=balanced?i%2:theta[0]>theta[1]?0:1;
            next[group].n++;if(rng()<truth[group])next[group].y++;
        }
        return next;
    }
    function designStats(reflection,friction,budget=6) {
        const selected=rankClips(reflection).slice(0,3);
        const value=selected.reduce((s,c)=>s+c.reflection,0)/3;
        const engage=selected.reduce((s,c)=>s+engagement(c),0)/3;
        const expected=survival(.05,friction,true).expected;
        const loss=(1-value)**2+.06*(1-engage)**2+.08*Math.max(0,expected-budget)**2;
        return {selected,value,engage,expected,loss};
    }
    function bestDesign(budget=6) {
        let best=null;
        for(let i=0;i<=10;i++)for(let j=0;j<=10;j++) {
            const reflection=i/10,friction=j/10,stats=designStats(reflection,friction,budget);
            if(!best||stats.loss<best.loss-1e-12)best={reflection,friction,...stats};
        }
        return best;
    }
    return {random,sample,softmax,tokens,tokenRows,languageLoss,languageGradient,languageStep,targets,proxyTarget,proxyLoss,proxyStep,clips,engagement,rankClips,rewardUpdate,rewardDeck,socialStep,survival,exposureLoss,exposureGradient,collectExposure,designStats,bestDesign};
});
