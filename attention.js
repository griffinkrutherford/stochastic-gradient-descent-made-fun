/* Eight computed studios: training, objectives, ranking, feedback, and design. */
(function () {
    'use strict';
    const C=window.AttentionCore,stories=window.AttentionStories,root=document.getElementById('attention-labs');
    const colors=['#a39aff','#72e6ce','#ffd481','#ff967f','#72d6ff','#b7a0ff','#d0ed9d','#ffaacb'];
    const scenes=[],tau=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),fmt=(v,n=3)=>Number(v).toFixed(n);
    let active=document.body.dataset.worksheetMode==='attention';
    function create(kind,story,index) {
        const section=document.createElement('section');section.id=`att-${kind}`;section.className='att-card';section.style.setProperty('--att-color',colors[index]);section.setAttribute('aria-labelledby',`att-${kind}-title`);
        section.innerHTML=`<div class="att-kicker">${String(index+1).padStart(2,'0')} / 08 · The attention machine</div><h3 id="att-${kind}-title">${story.title}</h3><p>${story.intro}</p><p class="att-principle">${story.principle}</p><div class="att-stage"><canvas id="att-${kind}-canvas" tabindex="0" role="img" aria-label="${story.title}. Arrow keys orbit, plus and minus zoom, Home resets. The nearby legend and summary explain the current state."></canvas></div><div class="att-legend"></div><div class="att-controls"></div><div class="att-actions att-experiments"></div><div class="att-actions att-camera"></div><p class="att-note">Drag to orbit; arrow keys rotate; +/− zoom; Home resets. The header controls decorative motion. Single steps always remain available.</p><p id="att-${kind}-summary" class="att-summary" aria-live="polite"></p><p class="att-note">${story.limit}</p><p class="att-evidence">${story.evidence}</p><p class="att-prompt">${story.prompt}</p><details class="att-reasoning"><summary>Follow the reasoning</summary><ol>${story.reasoning.map(([title,text])=>`<li><strong>${title}</strong><p>${text}</p></li>`).join('')}</ol></details>`;
        root.append(section);
        const s={kind,section,canvas:section.querySelector('canvas'),c:section.querySelector('canvas').getContext('2d'),controls:section.querySelector('.att-controls'),actions:section.querySelector('.att-experiments'),state:{},yaw:-.65,pitch:.5,zoom:1,orbit:true,visible:false,dirty:true,lastSummary:'',phase:0};
        const prediction=document.createElement('fieldset');prediction.className='att-prediction';
        const legend=document.createElement('legend');legend.textContent='Pause and predict · '+story.prediction[0];prediction.append(legend);
        const choices=document.createElement('div');choices.className='att-actions';prediction.append(choices);
        const feedback=document.createElement('p');feedback.className='att-feedback att-note';feedback.setAttribute('aria-live','polite');
        story.prediction[1].forEach((text,i)=>{
            const button=document.createElement('button');button.type='button';button.textContent=text;button.setAttribute('aria-pressed','false');
            button.addEventListener('click',()=>{choices.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));feedback.textContent=(i===story.prediction[2]?'That follows from the model. ':'Compare that prediction with the explanation. ')+story.prediction[3];});choices.append(button);
        });prediction.append(feedback);s.controls.before(prediction);
        story.legend.forEach(([text,color])=>{const span=document.createElement('span');span.textContent=text;span.style.setProperty('--swatch',color);section.querySelector('.att-legend').append(span);});
        const camera=section.querySelector('.att-camera');
        const orbit=button(s,'orbit','Turntable on',()=>{s.orbit=!s.orbit;orbit.textContent=s.orbit?'Turntable on':'Turntable off';orbit.setAttribute('aria-pressed',String(s.orbit));},camera);orbit.setAttribute('aria-pressed','true');
        button(s,'view-reset','Reset view',()=>{s.yaw=-.65;s.pitch=.5;s.zoom=1;},camera);
        let drag=null;
        s.canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY};s.canvas.setPointerCapture(e.pointerId);});
        s.canvas.addEventListener('pointermove',e=>{if(!drag)return;s.yaw+=(e.clientX-drag.x)*.008;s.pitch=clamp(s.pitch+(e.clientY-drag.y)*.004,-.7,1.25);drag={x:e.clientX,y:e.clientY};s.dirty=true;});
        ['pointerup','pointercancel','lostpointercapture'].forEach(event=>s.canvas.addEventListener(event,()=>{drag=null;}));
        s.canvas.addEventListener('keydown',e=>{
            if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key))return;e.preventDefault();
            if(e.key==='ArrowLeft')s.yaw-=.13;if(e.key==='ArrowRight')s.yaw+=.13;
            if(e.key==='ArrowUp')s.pitch=clamp(s.pitch+.1,-.7,1.25);if(e.key==='ArrowDown')s.pitch=clamp(s.pitch-.1,-.7,1.25);
            if(e.key==='+'||e.key==='=')s.zoom=clamp(s.zoom+.08,.6,1.1);if(e.key==='-')s.zoom=clamp(s.zoom-.08,.6,1.1);
            if(e.key==='Home'){s.yaw=-.65;s.pitch=.5;s.zoom=1;}s.dirty=true;
        });
        new IntersectionObserver(entries=>{s.visible=entries[0].isIntersecting;s.dirty=true;},{rootMargin:'80px'}).observe(s.canvas);
        new ResizeObserver(()=>{s.dirty=true;}).observe(s.canvas);
        scenes.push(s);return s;
    }
    function button(s,action,text,callback,target=s.actions) {
        const b=document.createElement('button');b.type='button';b.id=`att-${s.kind}-${action}`;b.textContent=text;
        b.addEventListener('click',()=>{callback();s.dirty=true;});target.append(b);return b;
    }
    function slider(s,key,label,min,max,step,value,change) {
        const wrapper=document.createElement('label'),id=`att-${s.kind}-${key}`;wrapper.htmlFor=id;
        const title=document.createElement('span');title.append(label+' · ');const output=document.createElement('output');title.append(output);
        const input=document.createElement('input');input.id=id;input.type='range';Object.assign(input,{min,max,step,value});s.state[key]=value;
        const update=()=>{s.state[key]=Number(input.value);output.value=fmt(s.state[key],step>=1?0:2);change?.();s.dirty=true;};input.addEventListener('input',update);output.value=fmt(value,step>=1?0:2);wrapper.append(title,input);s.controls.append(wrapper);return input;
    }
    function select(s,key,label,options,value,change) {
        const wrapper=document.createElement('label'),input=document.createElement('select');input.id=`att-${s.kind}-${key}`;wrapper.htmlFor=input.id;wrapper.append(label);
        for(const [v,text] of options){const o=document.createElement('option');o.value=v;o.textContent=text;input.append(o);}input.value=value;s.state[key]=value;
        input.addEventListener('change',()=>{s.state[key]=input.value;change?.();s.dirty=true;});wrapper.append(input);s.controls.append(wrapper);return input;
    }
    function setInput(s,key,value) {const input=document.getElementById(`att-${s.kind}-${key}`);input.value=value;input.dispatchEvent(new Event(input.tagName==='SELECT'?'change':'input'));}
    function summary(s,text) {if(s.lastSummary!==text){s.section.querySelector('.att-summary').textContent=text;s.lastSummary=text;}}
    Object.entries(stories).forEach(([kind,story],i)=>create(kind,story,i));
    const get=kind=>scenes.find(s=>s.kind===kind);
    const language=get('language');
    function resetLanguage() {Object.assign(language.state,{theta:[0,0],path:[[0,0]],steps:0,processed:0,rng:C.random(language.state.seed),selected:[],last:null});}
    slider(language,'rate','Step fraction',.1,1,.05,.6);
    select(language,'batch','Examples per update',[['1','1 example'],['4','4 examples'],['10','All 10 examples']],'10');
    slider(language,'seed','Reproducible sequence',1,99,1,42,resetLanguage);resetLanguage();
    button(language,'step','Take one training step',()=>{
        const st=language.state,ids=C.sample(Number(st.batch),10,st.rng),rows=ids.map(i=>C.tokenRows[i]);
        st.last={before:st.theta.slice(),gradient:C.languageGradient(st.theta,rows)};st.theta=C.languageStep(st.theta,st.rate,rows);st.path.push(st.theta.slice());st.selected=ids;st.steps++;st.processed+=ids.length;
    });
    button(language,'fit','Fit using all ten examples',()=>{const st=language.state;for(let i=0;i<180;i++){st.theta=C.languageStep(st.theta,.6);st.path.push(st.theta.slice());}st.steps+=180;st.processed+=1800;st.selected=Array.from({length:10},(_,i)=>i);st.last=null;});
    button(language,'reset','Reset training',resetLanguage);
    const examples=document.createElement('div');examples.className='att-example-rows';examples.setAttribute('aria-label','Ten fictional training examples; selected rows are outlined');examples.innerHTML=C.tokenRows.map((label,i)=>`<span data-att-row="${i}">${i+1} · ${C.tokens[label]}</span>`).join('');language.actions.before(examples);
    const objective=get('objective');
    slider(objective,'weight','Weight on watching',0,1,.05,1,()=>{objective.state.path=[objective.state.theta.slice()];});
    Object.assign(objective.state,{theta:[-.8,.8],path:[[-.8,.8]]});
    button(objective,'step','Move 25% toward the target',()=>{objective.state.theta=C.proxyStep(objective.state.theta,objective.state.weight);objective.state.path.push(objective.state.theta.slice());});
    button(objective,'watching','Choose watching only',()=>setInput(objective,'weight',1));
    button(objective,'reflection','Choose reflection only',()=>setInput(objective,'weight',0));
    button(objective,'reset','Reset estimate',()=>{objective.state.theta=[-.8,.8];objective.state.path=[[-.8,.8]];});
    const ranking=get('ranking');slider(ranking,'reflection','Reflection weight',0,1,.05,0);slider(ranking,'comments','Comments within engagement',0,1,.05,.3);
    button(ranking,'comments-heavy','Rank by comments',()=>{setInput(ranking,'reflection',0);setInput(ranking,'comments',1);});
    button(ranking,'reflective','Rank by reflection',()=>setInput(ranking,'reflection',1));
    const table=document.createElement('table');table.className='att-data';table.innerHTML='<caption>Fictional candidate scores · 0 to 1 · larger is more</caption><thead><tr><th scope="col">Clip</th><th scope="col">Watch</th><th scope="col">Comment</th><th scope="col">Reflect</th></tr></thead><tbody>'+C.clips.map(c=>`<tr><th scope="row">${c.name}</th><td>${fmt(c.watch,2)}</td><td>${fmt(c.comments,2)}</td><td>${fmt(c.reflection,2)}</td></tr>`).join('')+'</tbody>';ranking.section.querySelector('.att-summary').after(table);
    const outrage=get('outrage');
    function resetSocial(){Object.assign(outrage.state,{creator:[.5,.5],ranker:[.5,.5],steps:0,rng:C.random(outrage.state.seed),last:null,history:[]});}
    slider(outrage,'norm','Group approval bonus',0,1,.05,1);slider(outrage,'seed','Reproducible sequence',1,99,1,17,resetSocial);resetSocial();
    function socialStep(){const st=outrage.state,next=C.socialStep(st,st.norm,st.rng);st.creator=next.creator;st.ranker=next.ranker;st.last=next;st.steps++;st.history.push(next.selected);}
    button(outrage,'step','Trace one feedback cycle',socialStep);button(outrage,'run','Compare after 60 cycles',()=>{for(let i=0;i<60;i++)socialStep();});button(outrage,'reset','Reset both learners',resetSocial);
    const surprise=get('surprise');
    function resetDeck(){Object.assign(surprise.state,{deck:C.rewardDeck(surprise.state.seed),q:.4,fixed:.4,index:0,history:[],last:null});}
    slider(surprise,'seed','Shuffle the twelve-card deck',1,99,1,42,resetDeck);resetDeck();
    function reveal(){const st=surprise.state;if(st.index>=12)return;const reward=st.deck[st.index],update=C.rewardUpdate(st.q,reward);st.last={before:st.q,reward,...update};st.q=update.next;st.history.push({reward,q:st.q});st.index++;}
    button(surprise,'step','Reveal the next reward',reveal);button(surprise,'run','Reveal all twelve',()=>{while(surprise.state.index<12)reveal();});button(surprise,'reset','Replay this order',resetDeck);
    const stopping=get('stopping');slider(stopping,'cost','Effort cost at every transition',0,.5,.01,.15);slider(stopping,'friction','Extra friction at checkpoints',0,1,.05,.5);
    button(stopping,'no-friction','Remove checkpoint friction',()=>setInput(stopping,'friction',0));button(stopping,'pause','Add a decision checkpoint',()=>setInput(stopping,'friction',.7));
    const exposure=get('exposure');
    function resetExposure(){Object.assign(exposure.state,{theta:[.4,.7],counts:[{n:0,y:0},{n:8,y:6}],rng:C.random(exposure.state.seed),path:[[.4,.7]],updates:0});}
    slider(exposure,'seed','Reproducible observations',1,99,1,42,resetExposure);resetExposure();
    button(exposure,'ranked','Collect 10 ranked examples',()=>{exposure.state.counts=C.collectExposure(exposure.state.theta,exposure.state.counts,exposure.state.rng);exposure.state.path=[exposure.state.theta.slice()];});
    button(exposure,'balanced','Test both: 10 observations each',()=>{exposure.state.counts=C.collectExposure(exposure.state.theta,exposure.state.counts,exposure.state.rng,true);exposure.state.path=[exposure.state.theta.slice()];});
    button(exposure,'fit','Fit the observed rows',()=>{const st=exposure.state;for(let i=0;i<50;i++){const g=C.exposureGradient(st.theta,st.counts);st.theta=st.theta.map((v,j)=>v-.5*g[j]);st.path.push(st.theta.slice());st.updates++;}});
    button(exposure,'reset','Reset missing-data experiment',resetExposure);
    const redesign=get('redesign');slider(redesign,'reflection','Reflection weight in ranking',0,1,.05,0);slider(redesign,'friction','Decision checkpoint friction',0,1,.05,0);slider(redesign,'budget','Intended clip budget',4,12,1,6);
    button(redesign,'search','Search all 121 designs',()=>{const best=C.bestDesign(redesign.state.budget);setInput(redesign,'reflection',best.reflection);setInput(redesign,'friction',best.friction);redesign.state.searched=true;});
    button(redesign,'baseline','Restore engagement-first baseline',()=>{setInput(redesign,'reflection',0);setInput(redesign,'friction',0);redesign.state.searched=false;});
    const meters=document.createElement('div');meters.className='att-meters';meters.innerHTML='<div class="att-meter">Mean reflection<strong id="att-design-value"></strong>invented response score</div><div class="att-meter">Expected clips<strong id="att-design-clips"></strong>under this continuation rule</div><div class="att-meter">Toy design loss<strong id="att-design-loss"></strong>lower under our chosen goal</div>';redesign.section.querySelector('.att-summary').before(meters);
    // Canvas primitives. Camera bounds include meshes, labels' margins, and full paths.
    function begin(s) {
        const rect=s.canvas.getBoundingClientRect(),W=rect.width,H=rect.height;if(W<1||H<1)return null;
        const dpr=Math.min(devicePixelRatio||1,2);if(s.canvas.width!==Math.round(W*dpr)||s.canvas.height!==Math.round(H*dpr)){s.canvas.width=Math.round(W*dpr);s.canvas.height=Math.round(H*dpr);}
        const c=s.c;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
        const g=c.createRadialGradient(W*.45,H*.35,10,W*.5,H*.5,Math.max(W,H)*.8);g.addColorStop(0,'#173347');g.addColorStop(1,'#06101e');c.fillStyle=g;c.fillRect(0,0,W,H);
        c.strokeStyle='#a1d5ff08';c.lineWidth=1;for(let x=20;x<W;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}for(let y=20;y<H;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
        for(let i=0;i<38;i++){c.fillStyle='#9edfff30';c.fillRect((i*191+13)%W,(i*137+31)%H,1,1);}return {W,H};
    }
    function line(s,a,b,color='#a39aff',width=2,dash=false){const c=s.c;c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash?[4,5]:[]);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.setLineDash([]);}
    function text(s,value,x,y,color='#dfeeff',size=12,align='left'){const c=s.c;c.fillStyle=color;c.font=`600 ${size}px system-ui,sans-serif`;c.textAlign=align;c.fillText(value,x,y);}
    function polygon(s,points,color,stroke){const c=s.c;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=.6;c.stroke();}}
    function dot(s,p,color='#ffd481',radius=5){const c=s.c;c.shadowColor=color;c.shadowBlur=14;c.fillStyle=color;c.beginPath();c.arc(p[0],p[1],radius,0,tau);c.fill();c.shadowBlur=0;}
    function panels(W,H){return W<500?[{x:0,y:18,w:W,h:H*.58-18},{x:0,y:H*.61,w:W,h:H*.39-8}]:[{x:0,y:18,w:W*.66,h:H-34},{x:W*.69,y:22,w:W*.29,h:H-34}];}
    function camera(s,points,box){
        function raw(p){const c=Math.cos(s.yaw),n=Math.sin(s.yaw),u=p[0]*c-p[2]*n,z=p[0]*n+p[2]*c,cy=Math.cos(s.pitch),sy=Math.sin(s.pitch),v=p[1]*cy-z*sy,d=p[1]*sy+z*cy,f=9/(9-d);return [u*f,v*f,d];}
        const q=points.map(raw),xs=q.map(p=>p[0]),ys=q.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),mx=(minX+maxX)/2,my=(minY+maxY)/2;
        const scale=Math.min((box.w-64)/Math.max(.5,maxX-minX),(box.h-74)/Math.max(.5,maxY-minY))*s.zoom;
        return p=>{const q=raw(p);return [box.x+box.w/2+(q[0]-mx)*scale,box.y+box.h/2-(q[1]-my)*scale,q[2]];};
    }
    function bars(s,box,title,rows){
        text(s,title,box.x+box.w/2,box.y+15,'#d9efff',11,'center');
        const top=box.y+43,step=Math.min(66,(box.h-60)/rows.length);
        rows.forEach(([label,value,color,display],i)=>{const y=top+i*step;text(s,label,box.x+8,y,color,11);text(s,display??fmt(value,2),box.x+box.w-8,y,'#e9f5ff',11,'right');s.c.fillStyle='#3d536d';s.c.fillRect(box.x+8,y+9,box.w-16,8);s.c.fillStyle=color;s.c.fillRect(box.x+8,y+9,(box.w-16)*clamp(value,0,1),8);});
    }
    function surface(s,box,fn,range,theta,target,path=[],axis=['knob 1','knob 2'],title='LOWER HEIGHT = LESS ERROR') {
        const [lo,hi]=range,n=22,raw=[];for(let i=0;i<=n;i++)for(let j=0;j<=n;j++){const x=lo+(hi-lo)*i/n,z=lo+(hi-lo)*j/n;raw.push([x,fn(x,z),z]);}
        const ys=raw.map(p=>p[1]),min=Math.min(...ys),max=Math.max(...ys),factor=(hi-lo)*.62/Math.max(.025,max-min);
        const point=p=>[p[0],(fn(...p)-min)*factor,p[1]],mapped=raw.map(p=>[p[0],(p[1]-min)*factor,p[2]]);
        const data=[...mapped,[lo,-.015,lo],[lo,-.015,hi],[hi,-.015,lo],[hi,-.015,hi],point(theta),...(target?[point(target)]:[]),...path.map(point)],project=camera(s,data,box),faces=[];
        for(let i=0;i<n;i++)for(let j=0;j<n;j++){const ids=[i*(n+1)+j,(i+1)*(n+1)+j,(i+1)*(n+1)+j+1,i*(n+1)+j+1],points=ids.map(k=>project(mapped[k])),height=ids.reduce((v,k)=>v+(raw[k][1]-min)/(max-min||1),0)/4;faces.push({points,depth:points.reduce((v,p)=>v+p[2],0),height});}
        faces.sort((a,b)=>a.depth-b.depth).forEach(({points,height})=>polygon(s,points,`hsla(${185+height*75},65%,${29+height*16}%,.83)`,'#ace6ff28'));
        for(let i=1;i<path.length;i++)line(s,project(point(path[i-1])),project(point(path[i])),'#ffd481aa',2);
        if(target){const p=project(point(target));dot(s,p,'#72e6ce',6);s.c.strokeStyle='#72e6ce';s.c.lineWidth=1;s.c.beginPath();s.c.arc(p[0],p[1],11,0,tau);s.c.stroke();}
        dot(s,project(point(theta)),'#ffd481',6);
        const origin=project([lo,-.015,lo]),endA=project([hi,-.015,lo]),endB=project([lo,-.015,hi]);
        line(s,origin,endA,'#72d6ff90',1.5,true);line(s,origin,endB,'#ffaacb90',1.5,true);
        text(s,'A +',clamp(endA[0],box.x+20,box.x+box.w-24),clamp(endA[1]+17,box.y+35,box.y+box.h-28),'#72d6ff',10,'center');
        text(s,'B +',clamp(endB[0],box.x+20,box.x+box.w-24),clamp(endB[1]+17,box.y+35,box.y+box.h-28),'#ffaacb',10,'center');
        text(s,title,box.x+box.w/2,box.y+7,'#c7e4ff',10,'center');
        text(s,`A: ${axis[0]} · B: ${axis[1]}`,box.x+box.w/2,box.y+box.h-3,'#97cbdc',9,'center');
        return {project,point};
    }
    function cuboid(s,project,x,z,height,color,width=.24) {
        const pts=[[-width,0,-width],[width,0,-width],[width,0,width],[-width,0,width],[-width,height,-width],[width,height,-width],[width,height,width],[-width,height,width]].map(p=>project([p[0]+x,p[1],p[2]+z]));
        [[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]].map(ids=>({p:ids.map(i=>pts[i]),d:ids.reduce((v,i)=>v+pts[i][2],0)})).sort((a,b)=>a.d-b.d).forEach(({p})=>polygon(s,p,color+'80',color+'cc'));
        return project([x,height,z]);
    }
    function renderLanguage(s,W,H){
        const [a,b]=panels(W,H),st=s.state,p=C.softmax([...st.theta,0]),target=[Math.log(6),Math.log(3)],range=[Math.min(-2,...st.path.flat())-.2,Math.max(2.4,...st.path.flat())+.2];
        surface(s,a,(x,y)=>C.languageLoss([x,y]),range,st.theta,target,st.path,['steep score','quiet score']);bars(s,b,'NEXT-WORD PROBABILITIES',p.map((v,i)=>[C.tokens[i],v,colors[i],fmt(v*100,1)+'%']));
        s.section.querySelectorAll('[data-att-row]').forEach(el=>{const selected=st.selected.includes(Number(el.dataset.attRow));el.classList.toggle('is-selected',selected);el.setAttribute('aria-label',el.textContent+(selected?', selected for this update':''));});
        const selected=st.selected.length?st.selected.map(i=>`${i+1}:${C.tokens[C.tokenRows[i]]}`).join(', '):'none yet';
        summary(s,`Settings (${fmt(st.theta[0])}, ${fmt(st.theta[1])}); full-data loss ${fmt(C.languageLoss(st.theta),4)}. ${st.steps} updates · ${st.processed} examples processed. Selected rows: ${selected}. ${st.last?`Last gradient (${st.last.gradient.map(v=>fmt(v)).join(', ')}); step ${fmt(st.rate,2)}. Before (${st.last.before.map(v=>fmt(v)).join(', ')}).`:''} Reference optimum probabilities: 60%, 30%, 10%.`);
    }
    function renderObjective(s,W,H){
        const [a,b]=panels(W,H),st=s.state,target=C.proxyTarget(st.weight),result=surface(s,a,(x,y)=>C.proxyLoss([x,y],st.weight),[-1.2,1.2],st.theta,target,st.path,['abstract knob 1','abstract knob 2']);
        const points=[C.targets.engagement,C.targets.reflection].map(result.point).map(result.project);dot(s,points[0],'#ff967f',4);dot(s,points[1],'#72d6ff',4);
        bars(s,b,'WHAT GETS WEIGHT?',[[ 'Watching',st.weight,'#ff967f'],['Reflection',1-st.weight,'#72e6ce']]);
        summary(s,`Watching weight ${fmt(st.weight,2)}; reflection weight ${fmt(1-st.weight,2)}. Current settings (${st.theta.map(v=>fmt(v)).join(', ')}); weighted optimum (${target.map(v=>fmt(v)).join(', ')}). Toy loss ${fmt(C.proxyLoss(st.theta,st.weight),4)}. Changing weights changes the objective; taking a step changes only the settings.`);
    }
    function renderRanking(s,W,H){
        const [a,b]=panels(W,H),st=s.state,ranked=C.rankClips(st.reflection,st.comments),bounds=[[-2,0,-.5],[2,1.5,.8]],project=camera(s,bounds,a);
        ranked.slice().reverse().forEach((clip)=>{const rank=ranked.indexOf(clip),x=(rank-2.5)*.6,p=cuboid(s,project,x,0,clip.score*1.25,clip.color,.18);dot(s,p,rank<3?'#ffd481':clip.color,rank<3?5:3);text(s,String(rank+1),p[0],p[1]-13,'#f6f4e0',11,'center');});
        const gate=[[-1.9,0,.45],[0,0,.45],[0,1.4,.45],[-1.9,1.4,.45]].map(project);gate.forEach((p,i)=>line(s,p,gate[(i+1)%4],'#ffd48166',1.5,true));
        text(s,'TOP-THREE GATE',a.x+a.w/2,a.y+8,'#ffd481',10,'center');text(s,'Rank → · height = final score',a.x+a.w/2,a.y+a.h-3,'#9ac9df',11,'center');
        bars(s,b,'ORDERED CANDIDATES',ranked.map(c=>[c.name,c.score,c.color]));
        summary(s,`Top three: ${ranked.slice(0,3).map(c=>c.name).join(' → ')}. Reflection weight ${fmt(st.reflection,2)}; comments weight within engagement ${fmt(st.comments,2)}. Leading score ${fmt(ranked[0].score)}. These are rankings from the table, not observations of what a person truly wants.`);
    }
    function renderOutrage(s,W,H){
        const [a,b]=panels(W,H),st=s.state,nodes=[[-1,0,-.8],[1,.5,-.6],[0,1,1]],project=camera(s,[...nodes,[-1.4,-.4,-1.2],[1.4,1.4,1.3]],a),p=nodes.map(project),nodeColors=['#b7a0ff','#ffd481','#72d6ff'];
        for(let i=0;i<3;i++){line(s,p[i],p[(i+1)%3],nodeColors[i]+'80',3);const t=(s.phase*.45+i/3)%1,pt=p[i].map((v,j)=>v+(p[(i+1)%3][j]-v)*t);dot(s,pt,nodeColors[i],4);dot(s,p[i],nodeColors[i],13);}
        const names=['Creator','Viewers','Ranker'],labels=[];
        p.forEach((point,i)=>{
            const c=s.c,g=c.createRadialGradient(point[0]-6,point[1]-8,2,point[0],point[1],18);g.addColorStop(0,'#ffffff');g.addColorStop(.3,nodeColors[i]);g.addColorStop(1,'#182438');c.fillStyle=g;c.beginPath();c.arc(point[0],point[1],18,0,tau);c.fill();
            const ring=Array.from({length:49},(_,j)=>project([nodes[i][0]+.3*Math.cos(j*tau/48),nodes[i][1]+.06*Math.sin(j*tau/48),nodes[i][2]+.3*Math.sin(j*tau/48)]));for(let j=0;j<48;j++)line(s,ring[j],ring[j+1],nodeColors[i]+'90',1);
            s.c.font='600 12px system-ui,sans-serif';const width=s.c.measureText(names[i]).width+10;
            const options=[[0,38],[0,-30],[-60,4],[60,4],[0,-52]];
            let chosen=options.map(([dx,dy])=>({x:point[0]+dx,y:point[1]+dy})).find(pos=>{
                const rect={x:pos.x-width/2,y:pos.y-13,w:width,h:19};
                if(rect.x<a.x+10||rect.x+rect.w>a.x+a.w-10||rect.y<a.y+30||rect.y+rect.h>a.y+a.h-65)return false;
                if(p.some((other,j)=>j!==i&&other[0]>rect.x-22&&other[0]<rect.x+rect.w+22&&other[1]>rect.y-22&&other[1]<rect.y+rect.h+22))return false;
                return !labels.some(r=>rect.x<r.x+r.w+5&&rect.x+rect.w>r.x-5&&rect.y<r.y+r.h+5&&rect.y+rect.h>r.y-5);
            })||{x:clamp(point[0],a.x+width,a.x+a.w-width),y:clamp(point[1]-35,a.y+55,a.y+a.h-76)};
            const rect={x:chosen.x-width/2,y:chosen.y-13,w:width,h:19};labels.push(rect);s.c.fillStyle='#0b182be6';s.c.fillRect(rect.x,rect.y,rect.w,rect.h);text(s,names[i],chosen.x,chosen.y,nodeColors[i],12,'center');
        });
        for(let i=0;i<3;i++){const start=p[i],end=p[(i+1)%3],dx=end[0]-start[0],dy=end[1]-start[1],len=Math.hypot(dx,dy),tip=[start[0]+dx*.62,start[1]+dy*.62],ux=dx/(len||1),uy=dy/(len||1);polygon(s,[tip,[tip[0]-ux*12-uy*5,tip[1]-uy*12+ux*5],[tip[0]-ux*12+uy*5,tip[1]-uy*12-ux*5]],nodeColors[i]);}
        const insetY=a.y+a.h-43;line(s,[a.x+20,insetY-17],[a.x+a.w-20,insetY-17],'#58788d',1);
        text(s,'Post → response → future exposure',a.x+a.w/2,insetY,'#ffdca0',W<500?10:12,'center');
        text(s,'FEEDBACK SIGNALS TRAVEL AROUND THE LOOP',a.x+a.w/2,a.y+7,'#d5eaff',9,'center');text(s,'Spatial layout is a diagram, not a data axis',a.x+a.w/2,a.y+a.h-3,'#a3c1d3',10,'center');
        const probs=C.softmax(st.creator.map((v,i)=>v+st.ranker[i]),.35);
        bars(s,b,'NEXT POST-TYPE CHANCE',[['Ordinary',probs[0],'#72e6ce',fmt(probs[0]*100,1)+'%'],['Outrage',probs[1],'#ff967f',fmt(probs[1]*100,1)+'%'],['Approval bonus',st.norm,'#ffd481']]);
        summary(s,`${st.steps} feedback cycles. Creator expectations: ordinary ${fmt(st.creator[0])}, outrage ${fmt(st.creator[1])}; ranker expectations: ${st.ranker.map(v=>fmt(v)).join(', ')}. ${st.last?`Last post: ${st.last.selected?'outrage':'ordinary'}; fictional reward ${fmt(st.last.reward)}. Only that type’s two expectations updated.`:'Both learners start with equal expectations.'} The approval advantage is an assumption you control.`);
    }
    function renderSurprise(s,W,H){
        const [a,b]=panels(W,H),st=s.state,bounds=[[-2.7,0,-.6],[2.7,1.35,.8]],project=camera(s,bounds,a);
        const rails=[-.45,.45];rails.forEach((z,k)=>line(s,project([-2.5,0,z]),project([2.5,0,z]),k?'#ffd48160':'#72d6ff60',1));
        for(let i=0;i<12;i++){const x=(i-5.5)*.42; cuboid(s,project,x,-.45,.4,'#72d6ff',.09);if(i<st.index){const reward=st.history[i].reward,p=cuboid(s,project,x,.45,reward,'#ffd481',.09),expected=project([x,st.history[i].q,.45]);dot(s,expected,'#b7a0ff',3);line(s,p,expected,'#ff967f',2,true);}else{const p=cuboid(s,project,x,.45,.4,'#6a8399',.09);if(i===st.index)text(s,'?',p[0],p[1]-8,'#dae8f6',12,'center');}}
        for(let i=1;i<st.history.length;i++)line(s,project([(i-1-5.5)*.42,st.history[i-1].q,.45]),project([(i-5.5)*.42,st.history[i].q,.45]),'#b7a0ff',2);
        text(s,'SAME TWELVE-CARD MEAN · 0.4',a.x+a.w/2,a.y+7,'#d4ebff',10,'center');text(s,'Card order → · height = reward units',a.x+a.w/2,a.y+a.h-3,'#98c6db',10,'center');
        bars(s,b,'REWARD AND EXPECTATION',[[ 'Last reward',st.last?.reward??0,'#ffd481',st.last?fmt(st.last.reward,2):'unrevealed'],['Expectation Q',st.q,'#b7a0ff'],['Constant-stream Q',.4,'#72d6ff']]);
        summary(s,`${st.index}/12 cards revealed. Variable-stream expectation ${fmt(st.q,4)}; predictable-stream expectation 0.4000. ${st.last?`Last reward ${fmt(st.last.reward,2)} − prior expectation ${fmt(st.last.before,4)} = prediction error ${fmt(st.last.error,4)}. New Q = prior Q + 0.25 × error = ${fmt(st.last.next,4)}.`:'Both expectations start at 0.4.'} Deck mean is exactly 0.4 in either order. This is not a biological measurement.`);
    }
    function renderStopping(s,W,H){
        const [a,b]=panels(W,H),st=s.state,no=C.survival(st.cost,0,false),yes=C.survival(st.cost,st.friction,true),bounds=[[-2.4,0,-.7],[2.4,1.3,.7]],project=camera(s,bounds,a);
        const layers=[{z:-.4,data:no,color:'#ff967f'},{z:.4,data:yes,color:'#72e6ce'}];
        layers.slice().sort((u,v)=>project([0,0,u.z])[2]-project([0,0,v.z])[2]).forEach(layer=>{for(let i=0;i<20;i++){const x=(i-9.5)*.23;cuboid(s,project,x,layer.z,layer.data.values[i],layer.color,.07);if(i>0&&i%5===0&&layer.z>0){line(s,project([x-.12,0,layer.z]),project([x-.12,1.15,layer.z]),'#ffd481',2,true);}}});
        text(s,'SAME CONTENT · DIFFERENT STOPPING CONTEXT',a.x+a.w/2,a.y+7,'#d8ecff',9,'center');text(s,'Clip number → · height = chance of reaching it',a.x+a.w/2,a.y+a.h-3,'#a1cbdc',9,'center');
        bars(s,b,'EXPECTED CLIPS OUT OF 20',[['No checkpoints',no.expected/20,'#ff967f',fmt(no.expected,2)],['With checkpoints',yes.expected/20,'#72e6ce',fmt(yes.expected,2)],['Reach clip 6',yes.values[5],'#ffd481',fmt(yes.values[5]*100,1)+'%']]);
        summary(s,`Expected clips: ${fmt(no.expected,2)} without checkpoints; ${fmt(yes.expected,2)} with them. Chance of reaching clip 6: ${fmt(yes.values[5]*100,1)}%. Every transition has effort cost ${fmt(st.cost,2)}; checkpoints add ${fmt(st.friction,2)} after clips 5, 10, and 15. Toy rule: continue probability = sigmoid(1 + 6 × (0.4 − effort − checkpoint friction)). The coefficient and intercept are assumed.`);
    }
    function renderExposure(s,W,H){
        const [a,b]=panels(W,H),st=s.state,reference=st.counts.map((c,i)=>c.n?c.y/c.n:st.theta[i]);
        const geom=surface(s,a,(x,y)=>C.exposureLoss([x,y],st.counts),[0,1],st.theta,reference,st.path,['quiet prediction','argument prediction'],st.counts[0].n?'EVIDENCE CURVES BOTH DIRECTIONS':'NO QUIET EVIDENCE · ONE FLAT DIRECTION');
        if(!st.counts[0].n){line(s,geom.project(geom.point([0,reference[1]])),geom.project(geom.point([1,reference[1]])),'#72e6ce',3);}
        bars(s,b,'OBSERVED RESPONSE RATES',st.counts.map((c,i)=>[i?'Sock argument':'Quiet clip',c.n?c.y/c.n:0,i?'#ff967f':'#72e6ce',c.n?`${c.y}/${c.n}`:'not observed']));
        summary(s,`Observed quiet: ${st.counts[0].y}/${st.counts[0].n}; argument: ${st.counts[1].y}/${st.counts[1].n}. Predictions (${st.theta.map(v=>fmt(v,4)).join(', ')}); observed-rate loss ${fmt(C.exposureLoss(st.theta,st.counts),6)}; ${st.updates} fitting updates. ${st.counts[0].n?'Both coordinates now have observations.':'The quiet coordinate is unconstrained by these observations.'} Generator truth: quiet 0.65, argument 0.75; sample rates need not equal those values.`);
    }
    function renderRedesign(s,W,H){
        const [a,b]=panels(W,H),st=s.state,result=C.designStats(st.reflection,st.friction,st.budget),best=C.bestDesign(st.budget),baseline=C.designStats(0,0,st.budget);
        surface(s,a,(x,y)=>C.designStats(x,y,st.budget).loss,[0,1],[st.reflection,st.friction],[best.reflection,best.friction],[],['reflection weight','checkpoint friction'],'DESIGN CHOICES · STEPPED OBJECTIVE');
        bars(s,b,'BASELINE → YOUR DESIGN',[['Reflection',result.value,'#72e6ce',fmt(baseline.value,2)+' → '+fmt(result.value,2)],['Expected clips',result.expected/20,'#ffd481',fmt(baseline.expected,1)+' → '+fmt(result.expected,1)],['Engagement',result.engage,'#ff967f',fmt(baseline.engage,2)+' → '+fmt(result.engage,2)]]);
        document.getElementById('att-design-value').textContent=fmt(result.value,2);document.getElementById('att-design-clips').textContent=fmt(result.expected,2);document.getElementById('att-design-loss').textContent=fmt(result.loss,4);
        summary(s,`Your top three: ${result.selected.map(c=>c.name).join(' → ')}. Intended budget ${st.budget} clips. Design loss ${fmt(result.loss,4)}; engagement-first baseline ${fmt(baseline.loss,4)}. Best of 121 grid settings: reflection ${fmt(best.reflection,1)}, friction ${fmt(best.friction,1)}, loss ${fmt(best.loss,4)}. ${st.searched?'Grid search applied.':'The green reference is a computed grid minimum.'} It is optimal under the stated toy assumptions, not proof of human benefit.`);
    }
    const renders={language:renderLanguage,objective:renderObjective,ranking:renderRanking,outrage:renderOutrage,surprise:renderSurprise,stopping:renderStopping,exposure:renderExposure,redesign:renderRedesign};
    window.syncAttention=mode=>{active=mode==='attention';scenes.forEach(s=>{s.dirty=true;});};
    let last=performance.now();
    function tick(now){const dt=Math.min((now-last)/1000,.05);last=now;if(active&&!document.hidden)for(const s of scenes){if(!s.visible&&!s.dirty)continue;if(!s.canvas.clientWidth||!s.canvas.clientHeight)continue;const moving=s.visible&&s.orbit&&!window.areWorksheetAnimationsPaused();if(moving){s.yaw+=dt*.12;s.phase+=dt;s.dirty=true;}if(s.dirty){const size=begin(s);if(size){renders[s.kind](s,size.W,size.H);s.dirty=false;}}}requestAnimationFrame(tick);}
    requestAnimationFrame(tick);
    const exit=document.getElementById('att-exit-response');
    try{exit.value=localStorage.getItem('attention-exit-response')||'';}catch{}
    exit.addEventListener('input',()=>{try{localStorage.setItem('attention-exit-response',exit.value);}catch{}});
    const printDetails=new Map();
    window.addEventListener('beforeprint',()=>{if(!active)return;root.querySelectorAll('details').forEach(d=>{printDetails.set(d,d.open);d.open=true;});});
    window.addEventListener('afterprint',()=>{printDetails.forEach((open,d)=>{d.open=open;});printDetails.clear();});
})();
