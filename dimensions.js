/* An eight-stop mathematical expedition. Every shape and cross-section is coordinate-derived. */
(function () {
    'use strict';
    const C = window.DimensionsCore, root = document.getElementById('dimensions-labs');
    const colors = ['#68e4ff','#ff87c9','#bdf881','#b9a0ff','#ffd477','#69efc0','#ff9479','#94adff'];
    const tau = Math.PI * 2, scenes = [], cube = C.hypercube(3), hypercube = C.hypercube(4);
    const clamp = (x,a,b) => Math.max(a,Math.min(b,x)), number = (x,d=2) => Number(x).toFixed(d);
    let active = document.body.dataset.worksheetMode === 'dimensions';
    const stops = [
        ['ladder','Build a dimension','A point becomes a line. Slide the line sideways: a square. Lift the square: a cube. Now repeat the rule in a fourth independent direction.',
            'The fourth direction is w, independent of x, y, and z. We project it into a 3D viewer and then onto your 2D screen; the picture is not the full object.',
            'Predict it: if every old corner gets a partner, how many corners would a 5D cube have?'],
        ['slice','A visitor to Flatland','Imagine living on a perfectly flat sheet. A ball passes through your world. You never see the ball all at once—only a circle that appears, grows, and shrinks.',
            'This is a section of a solid unit ball at z = a. Its circular boundary has radius √(1 − a²); the section includes the disk inside it. Beyond |a| = 1, there is no intersection.',
            'Try it: move the sheet from −1.2 to +1.2. Does a disappearing slice mean the whole ball disappeared?'],
        ['shadow','A shadow forgets something','Two corners can live at different depths and still land on exactly the same spot in a shadow. Move the cube and compare the 3D object with its flattened view.',
            'The right-hand diagram uses the orthographic projection (x, y, z) → (x, y). Unlike a slice, a projection combines contributions from the whole object. The 3D viewer adds ordinary screen perspective.',
            'Try it: at 0°, which differently colored corners overlap in the shadow? Can one shadow determine the whole object?'],
        ['tesseract','Turn in a direction you cannot point','Meet a tesseract: the 4D cousin of a cube. Rotate in x–w, y–w, or z–w. The drawing changes dramatically; the shape’s connections stay exactly the same.',
            'First: a genuine 4D rotation. Next: a 4D-to-3D projection. Finally: this 3D camera draws onto the screen. Crossing edges need not meet in 4D. Smaller-looking cubes are projection effects, not cubes physically nested inside one another.',
            'Try it: switch to an orthographic 4D projection at 0°. The matching w layers overlap; the missing direction has been discarded.'],
        ['net','Open the box. Then open the next box.','A cube unfolds into six squares on a sheet. A tesseract’s boundary unfolds into eight cubes in ordinary 3D space. Its faces are rooms!',
            'These are nets of the boundaries, not projections of the solids. Separating the pieces is an exploded view for inspection; the gap slider does not simulate the 4D folding motion.',
            'Try it: close the gaps. Why does the net of a 4D object need three dimensions rather than two?'],
        ['hypersphere','A 4D visitor to our world','Repeat the Flatland story one dimension higher. A solid 4D ball meets our w = constant space as an ordinary 3D ball: tiny, enormous, tiny, then gone.',
            'For x² + y² + z² + w² ≤ 1, fixing w = a gives a solid 3D ball with radius √(1 − a²). Dots illustrate points inside that ball; the wire boundary is not the whole volume. This is a mathematical slicing model, not a physical visitor.',
            'Predict it: at w = 0.6, how large is the radius? Compare this to the circle at z = 0.6 in Flatland.'],
        ['features','Six dimensions can taste like a smoothie','A coordinate need not be a direction in a room. Give your imaginary smoothie six independently adjustable scores. Two coordinates make a little map. The other four still matter.',
            'These are six normalized toy features, not measured taste data. The radar chart encodes six values on a 2D diagram; it is not a literal view of 6D geometry. The distance weights all six features equally.',
            'Try it: keep sweetness and sourness at zero; change only crunch. Two points stay together in the map, but their full 6D distance grows.'],
        ['escape','The extra-direction trick','A Flatlander is stuck inside a closed ink boundary. You can lift them above the sheet, carry them across, and set them down outside—without crossing the ink.',
            'The ink is a one-dimensional boundary in the z = 0 sheet, not a tall wall. This actual 3D path illustrates how an extra direction can bypass a lower-dimensional enclosure. The 4D room analogy is a thought experiment, not a travel method.',
            'Try it: pause at the crossing. Which coordinate makes the escape possible? If z had to stay zero, what would change?']
    ];
    function makeScene([kind,title,intro,note,prompt], index) {
        const section = document.createElement('section');
        section.id = `dim-${kind}`; section.className = 'dim-card'; section.style.setProperty('--dim-color',colors[index]);
        section.setAttribute('aria-labelledby',`dim-${kind}-title`);
        section.innerHTML = `<div class="dim-kicker">${String(index+1).padStart(2,'0')} / 08 · ${kind === 'features' ? 'Hidden coordinates' : 'A new way to see'}</div><h3 id="dim-${kind}-title">${title}</h3><p>${intro}</p><div class="dim-stage"><canvas id="dim-${kind}-canvas" tabindex="0" role="img" aria-label="${title}. The legend, controls, and summary describe the diagram. Arrow keys rotate, plus and minus zoom, Home resets."></canvas></div><div class="dim-legend"></div><div class="dim-controls"></div><div class="dim-views"></div><p id="dim-${kind}-summary" class="dim-summary" aria-live="polite"></p><p class="dim-note">${note}</p><p class="dim-prompt">${prompt}</p>`;
        root.appendChild(section);
        const s = { kind, index, section, canvas: section.querySelector('canvas'), ctx: section.querySelector('canvas').getContext('2d'), controls: section.querySelector('.dim-controls'), state: {}, yaw: -.65, pitch: .45, zoom: 1, orbit: true, visible: false, dirty: true, labels: [], lastSummary: '' };
        const views=section.querySelector('.dim-views');
        function viewButton(text,callback) { const b=document.createElement('button'); b.type='button'; b.textContent=text; b.addEventListener('click',()=>{callback();s.dirty=true}); views.append(b);return b; }
        if (kind !== 'features') {
            const orbit=viewButton('Turntable on',()=>{s.orbit=!s.orbit;orbit.textContent=s.orbit?'Turntable on':'Turntable off';orbit.setAttribute('aria-pressed',String(s.orbit))});
            orbit.dataset.dimAction='orbit';orbit.setAttribute('aria-pressed','true');
            viewButton('Reset view',()=>{s.yaw=-.65;s.pitch=.45;s.zoom=1}).dataset.dimAction='reset';
            const hint=document.createElement('p');hint.className='dim-note';hint.textContent='Drag horizontally to orbit. Arrow keys orbit; +/− zoom; Home resets. The header’s pause button controls all motion.';views.after(hint);
        } else { viewButton('Reset all six coordinates',()=>{s.state.values.fill(0);s.controls.querySelectorAll('input').forEach(e=>{e.value='0';e.dispatchEvent(new Event('input'))})}); }
        let drag=null;
        if(kind==='features')s.canvas.setAttribute('aria-label','Two-coordinate map and six-feature radar diagram. The labeled sliders and map-axis selectors update the summary.');
        s.canvas.addEventListener('pointerdown',e=>{ if(e.button!==0||kind==='features')return;drag={x:e.clientX,y:e.clientY};s.canvas.setPointerCapture(e.pointerId); });
        s.canvas.addEventListener('pointermove',e=>{if(!drag)return;s.yaw+=(e.clientX-drag.x)*.008;s.pitch=clamp(s.pitch+(e.clientY-drag.y)*.004,-.95,1.35);drag={x:e.clientX,y:e.clientY};s.dirty=true;});
        ['pointerup','pointercancel','lostpointercapture'].forEach(type=>s.canvas.addEventListener(type,()=>{drag=null}));
        s.canvas.addEventListener('keydown',e=>{
            if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(e.key)||kind==='features')return;e.preventDefault();
            if(e.key==='ArrowLeft')s.yaw-=.13;if(e.key==='ArrowRight')s.yaw+=.13;
            if(e.key==='ArrowUp')s.pitch=clamp(s.pitch+.1,-.95,1.35);if(e.key==='ArrowDown')s.pitch=clamp(s.pitch-.1,-.95,1.35);
            if(e.key==='+'||e.key==='=')s.zoom=clamp(s.zoom+.08,.65,1.15);if(e.key==='-')s.zoom=clamp(s.zoom-.08,.65,1.15);
            if(e.key==='Home'){s.yaw=-.65;s.pitch=.45;s.zoom=1;}s.dirty=true;
        });
        new IntersectionObserver(entries=>{s.visible=entries[0].isIntersecting;s.dirty=true;},{rootMargin:'80px'}).observe(s.canvas);
        new ResizeObserver(()=>{s.dirty=true}).observe(s.canvas);
        scenes.push(s);return s;
    }
    function slider(s,key,label,min,max,step,value) {
        s.state[key]=value; const id=`dim-${s.kind}-${key}`, el=document.createElement('label');
        el.htmlFor=id;el.innerHTML=`<span>${label} · <output id="${id}-value">${value}</output></span><input id="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-describedby="dim-${s.kind}-summary">`;
        const input=el.querySelector('input');input.addEventListener('input',()=>{s.state[key]=Number(input.value);el.querySelector('output').value=input.value;s.dirty=true;});s.controls.append(el);
    }
    function select(s,key,label,options,value) {
        s.state[key]=value;const el=document.createElement('label'),id=`dim-${s.kind}-${key}`;el.htmlFor=id;
        const text=document.createElement('span');text.textContent=label;const input=document.createElement('select');input.id=id;
        for(const [key,text] of options){const o=document.createElement('option');o.value=key;o.textContent=text;input.append(o)}input.value=value;
        input.addEventListener('change',()=>{s.state[key]=input.value;s.dirty=true;});el.append(text,input);s.controls.append(el);
    }
    function legend(s,items) {s.section.querySelector('.dim-legend').innerHTML=items.map(([text,color])=>`<span style="--swatch:${color}">${text}</span>`).join('');}
    function summary(s,text) {if(s.lastSummary!==text){s.section.querySelector('.dim-summary').textContent=text;s.lastSummary=text;}}
    stops.forEach(makeScene);
    const find=kind=>scenes.find(s=>s.kind===kind);
    slider(find('ladder'),'dimension','Independent directions',0,4,1,4);legend(find('ladder'),[['x direction',colors[0]],['y direction',colors[1]],['z direction',colors[2]],['w direction',colors[4]]]);
    slider(find('slice'),'slice','Sheet position z',-1.2,1.2,.01,.3);legend(find('slice'),[['whole 3D ball','#94adff'],['flat sheet','#ffd477'],['intersection disk','#ff87c9']]);
    slider(find('shadow'),'angle','Cube rotation (degrees)',0,180,1,0);legend(find('shadow'),[['z = −1 corners','#68e4ff'],['z = +1 corners','#ff87c9'],['shadow edges (depth removed)','#ffd477']]);
    const t=find('tesseract');slider(t,'angle','4D rotation (degrees)',0,360,1,28);
    select(t,'plane','Rotation plane',[['0','x–w'],['1','y–w'],['2','z–w']],'0');
    select(t,'projection','4D → 3D projection',[['perspective','Perspective'],['orthographic','Orthographic (drop w)']],'perspective');
    select(t,'cell','Highlight a boundary cell',[['all','Both w layers'],['-1','w = −1 cube'],['1','w = +1 cube']],'all');
    legend(t,[['original w = −1 layer','#68e4ff'],['original w = +1 layer','#ff87c9'],['edges in the original w direction','#ffd477']]);
    slider(find('net'),'gap','Separate the cells',0,1,.01,.15);legend(find('net'),[['left: six square faces','#68e4ff'],['right: eight cube cells','#ffd477'],...['center','−x','+x','−y','+y','−z','+z','next +z'].map((label,i)=>[`Cell ${i+1}: ${label}`,colors[i]])]);
    slider(find('hypersphere'),'slice','Our space’s position w',-1.2,1.2,.01,.4);legend(find('hypersphere'),[['unit-radius reference','#94adff'],['points in the 3D slice','#69efc0'],['slices along w','#ffd477']]);
    const features=find('features');features.state.values=[0,0,0,0,0,0];
    const names=['Sweetness','Sourness','Crunch','Warmth','Fizz','Aroma'];
    names.forEach((name,i)=>{slider(features,`feature-${i}`,name,-1,1,.05,0);const e=features.controls.lastElementChild;e.style.setProperty('--dim-color',colors[i]);e.querySelector('input').addEventListener('input',event=>{features.state.values[i]=Number(event.target.value)});});
    select(features,'x','Map horizontal axis',names.map((n,i)=>[String(i),n]),'0');select(features,'y','Map vertical axis',names.map((n,i)=>[String(i),n]),'1');
    legend(features,[['your smoothie','#ff9479'],['reference: all six scores are zero','#68e4ff']]);
    slider(find('escape'),'progress','Lift → travel → land',0,1,.01,.5);legend(find('escape'),[['ink boundary at z = 0','#ff9479'],['traveler above the sheet','#ffd477'],['landing place outside','#69efc0']]);

    function begin(s) {
        const rect=s.canvas.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2),W=rect.width,H=rect.height;
        if(W<1||H<1)return null;
        const width=Math.round(W*dpr),height=Math.round(H*dpr);if(s.canvas.width!==width||s.canvas.height!==height){s.canvas.width=width;s.canvas.height=height;}
        const c=s.ctx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
        const bg=c.createRadialGradient(W*.5,H*.4,10,W*.5,H*.5,Math.max(W,H)*.7);bg.addColorStop(0,'#192138');bg.addColorStop(1,'#060915');c.fillStyle=bg;c.fillRect(0,0,W,H);
        c.strokeStyle='#a5beff09';c.lineWidth=1;for(let x=20;x<W;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}for(let y=20;y<H;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
        for(let i=0;i<45;i++){const x=(i*197+33)%Math.ceil(W),y=(i*109+17)%Math.ceil(H);c.fillStyle=i%4===0?'#9a9aff55':'#95b8e722';c.fillRect(x,y,i%4===0?2:1,1);}
        s.labels=[];return {W,H,c};
    }
    function line(s,a,b,color,width=2,dashed=false) { const c=s.ctx;c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dashed?[4,5]:[]);c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();c.setLineDash([]); }
    function dot(s,p,color,r=4) {const c=s.ctx;c.shadowColor=color;c.shadowBlur=12;c.fillStyle=color;c.beginPath();c.arc(p[0],p[1],r,0,tau);c.fill();c.shadowBlur=0;}
    function text(s,value,x,y,color='#dde8ff',size=12,align='left') {const c=s.ctx;c.fillStyle=color;c.font=`600 ${size}px system-ui,sans-serif`;c.textAlign=align;c.fillText(value,x,y);}
    function fill(s,points,color) {const c=s.ctx;c.fillStyle=color;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fill();}
    function camera(s,points,box) {
        const rotated=points.map(p=>C.rotate(C.rotate(p,0,2,s.yaw),1,2,s.pitch));
        const raw=p=>{const q=C.rotate(C.rotate(p,0,2,s.yaw),1,2,s.pitch),f=9/(9-q[2]);return[q[0]*f,q[1]*f,q[2]];};
        const projected=rotated.map(q=>[q[0]*9/(9-q[2]),q[1]*9/(9-q[2])]);
        const xs=projected.map(p=>p[0]),ys=projected.map(p=>p[1]);
        const mx=(Math.max(...xs)+Math.min(...xs))/2,my=(Math.max(...ys)+Math.min(...ys))/2;
        const scale=Math.min((box.w-52)/Math.max(2,Math.max(...xs)-Math.min(...xs)),(box.h-62)/Math.max(2,Math.max(...ys)-Math.min(...ys)))*s.zoom;
        return p=>{const q=raw(p);return[box.x+box.w/2+(q[0]-mx)*scale,box.y+box.h/2-(q[1]-my)*scale,q[2]];};
    }
    function bounds(size=1.35) {return cube.vertices.map(p=>p.map(x=>x*size));}
    function wire(s,points,edges,project,color='#68e4ff',vertices=true) {
        edges.map(([a,b,axis])=>({a:project(points[a]),b:project(points[b]),axis})).sort((a,b)=>(a.a[2]+a.b[2])-(b.a[2]+b.b[2])).forEach(e=>line(s,e.a,e.b,typeof color==='function'?color(e.axis):color,2.3));
        if(vertices)points.map((p,i)=>({p:project(p),i})).sort((a,b)=>a.p[2]-b.p[2]).forEach(({p,i})=>dot(s,p,typeof color==='function'?colors[i%colors.length]:color,3.4));
    }
    function panels(W,H) {return W<500?[{x:0,y:0,w:W,h:H*.62},{x:0,y:H*.63,w:W,h:H*.37}]:[{x:0,y:0,w:W*.64,h:H},{x:W*.65,y:0,w:W*.35,h:H}];}
    function circle(s,center,r,color,solid=false,dash=false) {const c=s.ctx;c.beginPath();c.arc(center[0],center[1],Math.max(0,r),0,tau);if(solid){c.fillStyle=color+'25';c.fill();}c.strokeStyle=color;c.lineWidth=2;c.setLineDash(dash?[4,5]:[]);c.stroke();c.setLineDash([]);}
    function sphere(s,r,project,color) {
        if(r===null)return;
        for(let j=1;j<9;j++){const z=r*Math.cos(j*Math.PI/9),ring=Math.sqrt(Math.max(0,r*r-z*z)),points=Array.from({length:49},(_,i)=>project([ring*Math.cos(i*tau/48),ring*Math.sin(i*tau/48),z]));for(let i=0;i<48;i++)line(s,points[i],points[i+1],color+'80',1.1);}
        for(let j=0;j<8;j++){const phi=j*Math.PI/8,points=Array.from({length:65},(_,i)=>project([r*Math.sin(i*tau/64)*Math.cos(phi),r*Math.sin(i*tau/64)*Math.sin(phi),r*Math.cos(i*tau/64)]));for(let i=0;i<64;i++)line(s,points[i],points[i+1],color+'90',1.2);}
    }
    function renderLadder(s,W,H) {
        const n=s.state.dimension,data=C.hypercube(n),points=data.vertices.map(p=>[p[0]||0,p[1]||0,p[2]||0,p[3]||0]).map(p=>C.project4(p,4));
        const project=camera(s,[...points,...bounds(1.1)],{x:0,y:0,w:W,h:H});wire(s,points,data.edges,project,axis=>colors[axis===3?4:axis]);
        const name=['point','line segment','square','cube','tesseract'][n];text(s,`${n}D · ${name.toUpperCase()}`,18,28);
        summary(s,`${n} independent ${n===1?'direction':'directions'} → ${data.vertices.length} ${data.vertices.length===1?'corner':'corners'} and ${data.edges.length} edges. ${n===0?'A point has no extent.':`Adding a direction makes two copies and joins matching corners. Corners = 2^${n} = ${2**n}.`}${n===4?' The gold connectors are edges along w, not a fifth direction.':''}`);
    }
    function renderSlice(s,W,H) {
        const [a,b]=panels(W,H),z=s.state.slice,r=C.sliceRadius(z),project=camera(s,bounds(1.4),a);sphere(s,1,project,'#94adff');
        const plane=[[-1.2,-1.2,z],[1.2,-1.2,z],[1.2,1.2,z],[-1.2,1.2,z]].map(project);fill(s,plane,'#ffd47716');plane.forEach((p,i)=>line(s,p,plane[(i+1)%4],'#ffd47790',1));
        if(r!==null){const points=Array.from({length:65},(_,i)=>project([r*Math.cos(i*tau/64),r*Math.sin(i*tau/64),z]));fill(s,points,'#ff87c940');for(let i=0;i<64;i++)line(s,points[i],points[i+1],'#ff87c9',3);}
        text(s,'3D BALL + FLAT SHEET',a.x+16,a.y+27);text(s,'FLATLAND’S 2D SECTION',b.x+b.w/2,b.y+25,'#ff87c9',11,'center');
        const center=[b.x+b.w/2,b.y+b.h*.50],scale=Math.min(b.w*.32,b.h*.25);circle(s,center,scale,'#7280ad',false,true);
        if(r!==null){circle(s,center,scale*r,'#ff87c9',true);line(s,center,[center[0]+scale*r,center[1]],'#ffdd91',2);dot(s,center,'#ffdd91',2);}
        text(s,r===null?'No intersection':`radius ${number(r)}`,center[0],b.y+b.h-15,'#f4e7ff',12,'center');
        summary(s,`Sheet position z = ${number(z)}. ${r===null?'The sheet misses the ball: no disk exists.':`Section radius = √(1 − ${number(z)}²) = ${number(r)}. ${r===0?'At contact, the section is a single point.':'The disk grows toward z = 0 and shrinks toward either pole.'}`} The full 3D ball keeps radius 1.`);
    }
    function renderShadow(s,W,H) {
        const [a,b]=panels(W,H),angle=s.state.angle*Math.PI/180,points=cube.vertices.map(p=>C.rotate(p,0,2,angle)),project=camera(s,bounds(1.65),a);
        wire(s,points,cube.edges,project,'#b9a0ff',false);points.forEach((p,i)=>dot(s,project(p),cube.vertices[i][2]>0?'#ff87c9':'#68e4ff',4.3));
        const scale=Math.min(b.w*.28,(b.h-90)/2),shadow=p=>[b.x+b.w/2+p[0]*scale,b.y+(b.h+8)/2-p[1]*scale];
        cube.edges.forEach(([i,j])=>line(s,shadow(points[i]),shadow(points[j]),'#ffd477',2));
        points.forEach((p,i)=>circle(s,shadow(p),cube.vertices[i][2]>0?7:3,cube.vertices[i][2]>0?'#ff87c9':'#68e4ff',cube.vertices[i][2]<0));
        const distinct=new Set(points.map(p=>`${number(p[0],6)},${number(p[1],6)}`)).size;
        text(s,'3D OBJECT',a.x+16,a.y+26);text(s,'DROP z → KEEP (x, y)',b.x+b.w/2,b.y+26,'#ffd477',11,'center');
        text(s,`${distinct} distinct shadow positions`,b.x+b.w/2,b.y+b.h-15,'#e1dbed',11,'center');
        summary(s,`Cube rotation ${s.state.angle}°. Eight corners in 3D become ${distinct} distinct positions in the (x, y) shadow. ${distinct<8?'Blue and pink depth layers share positions: circles mark overlapping corners.':'The shadow separates these corners, but their z coordinates are still missing.'} A shadow is not a cross-section.`);
    }
    function renderTesseract(s,W,H) {
        const axis=Number(s.state.plane),angle=s.state.angle*Math.PI/180,orthographic=s.state.projection==='orthographic';
        const points=hypercube.vertices.map(p=>C.project4(C.rotate(p,axis,3,angle),4,orthographic)),project=camera(s,[...points,...bounds(1.5)],{x:0,y:0,w:W,h:H});
        // Faces of the two original w layers, with the cross-w edges drawn separately.
        const faces=[];
        for(const w of [-1,1])for(let fixed=0;fixed<3;fixed++)for(const sign of [-1,1]){
            const axes=[0,1,2].filter(x=>x!==fixed),indices=[[-1,-1],[1,-1],[1,1],[-1,1]].map(pair=>hypercube.vertices.findIndex(p=>p[3]===w&&p[fixed]===sign&&p[axes[0]]===pair[0]&&p[axes[1]]===pair[1]));
            faces.push({points:indices.map(i=>project(points[i])),color:w<0?'#68e4ff13':'#ff87c913'});
        }
        faces.sort((a,b)=>a.points.reduce((x,p)=>x+p[2],0)-b.points.reduce((x,p)=>x+p[2],0)).forEach(f=>fill(s,f.points,f.color));
        const edges=hypercube.edges.filter(([a,b])=>s.state.cell==='all'||(hypercube.vertices[a][3]===Number(s.state.cell)&&hypercube.vertices[b][3]===Number(s.state.cell)));
        edges.map(([a,b,dimension])=>({a:project(points[a]),b:project(points[b]),dimension,w:hypercube.vertices[a][3]})).sort((a,b)=>a.a[2]+a.b[2]-b.a[2]-b.b[2]).forEach(e=>line(s,e.a,e.b,e.dimension===3?'#ffd477':e.w<0?'#68e4ff':'#ff87c9',e.dimension===3?1.7:2.8));
        points.forEach((p,i)=>{if(s.state.cell==='all'||hypercube.vertices[i][3]===Number(s.state.cell))dot(s,project(p),hypercube.vertices[i][3]<0?'#68e4ff':'#ff87c9',4)});
        text(s,`${['x','y','z'][axis]}–w ROTATION · ${s.state.angle}°`,18,28);
        summary(s,`Always 16 vertices · 32 edges · 24 square faces · 8 cube cells. Rotation in ${['x','y','z'][axis]}–w: ${s.state.angle}°. ${orthographic?'Orthographic projection discards w; layers can overlap.':'Perspective projection uses (x, y, z) × 4 / (4 − w), after rotation.'} ${s.state.cell==='all'?'Both original w layers are visible.':`Highlighting the original w = ${s.state.cell} boundary cube; it still has 8 corners and 12 edges.`}`);
    }
    function renderNet(s,W,H) {
        const [a,b]=panels(W,H),gap=s.state.gap,unit=Math.min(a.w*.14,a.h*.15),center=[a.x+a.w*.5,a.y+a.h*.59];
        C.cubeNet.forEach(([x,y],i)=>{const px=center[0]+x*unit*(1+gap),py=center[1]-y*unit*(1+gap);fill(s,[[px-unit/2,py-unit/2],[px+unit/2,py-unit/2],[px+unit/2,py+unit/2],[px-unit/2,py+unit/2]],colors[i]+'42');s.ctx.strokeStyle=colors[i];s.ctx.lineWidth=2;s.ctx.strokeRect(px-unit/2,py-unit/2,unit,unit);text(s,String(i+1),px,py+4,colors[i],12,'center');});
        const cells=C.tesseractNet.map(center=>cube.vertices.map(p=>p.map((v,i)=>v*.44+center[i]*(.88+.4*gap))));
        const project=camera(s,cells.flat(),b);
        cells.map((points,i)=>({points,i,depth:project(points[0])[2]})).sort((a,b)=>a.depth-b.depth).forEach(({points,i})=>{
            for(let fixed=0;fixed<3;fixed++)for(const sign of [-1,1]){const axes=[0,1,2].filter(v=>v!==fixed),face=[[-1,-1],[1,-1],[1,1],[-1,1]].map(pair=>cube.vertices.findIndex(p=>p[fixed]===sign&&p[axes[0]]===pair[0]&&p[axes[1]]===pair[1]));fill(s,face.map(j=>project(points[j])),colors[i]+'14');}
            wire(s,points,cube.edges,project,colors[i],false);
        });
        text(s,'CUBE → 6 SQUARES',a.x+16,a.y+26,'#68e4ff',11);text(s,'TESSERACT → 8 CUBES',b.x+b.w/2,b.y+26,'#ffd477',11,'center');
        summary(s,`Left: a 2D cube net with 6 square faces. Right: a 3D cubical-cross net with 8 cubic cells, each color marking a different cell. Gap setting ${number(gap)}${gap===0?' (connected nets)': ' (separated for inspection)'}. The extra cube extends one branch; all eight fold around a 4D interior.`);
    }
    function renderHypersphere(s,W,H) {
        const [a,b]=panels(W,H),w=s.state.slice,r=C.sliceRadius(w),project=camera(s,bounds(1.35),a);sphere(s,1,project,'#94adff');
        if(r!==null){sphere(s,r,project,'#69efc0');for(let i=0;i<260;i++){const z=1-2*(i+.5)/260,phi=i*2.399963,rr=r*Math.cbrt(((i*73)%260+.5)/260),radial=Math.sqrt(1-z*z);dot(s,project([rr*radial*Math.cos(phi),rr*radial*Math.sin(phi),rr*z]),colors[i%6],1.6);}}
        text(s,'3D SECTION OF A 4D BALL',a.x+16,a.y+27,'#69efc0',11);
        text(s,'SLICE SIZE ALONG w',b.x+b.w/2,b.y+27,'#ffd477',11,'center');
        const coordinates=[-1,-.5,0,.5,1],horizontal=true;
        coordinates.forEach((value,i)=>{const x=horizontal?b.x+b.w*(.13+i*.185):b.x+b.w/2,y=horizontal?b.y+b.h*.5:b.y+58+i*(b.h-98)/4,scale=horizontal?b.w*.063:Math.min(24,b.w*.12);circle(s,[x,y],scale*C.sliceRadius(value),colors[i],true);dot(s,[x,y],colors[i],1);text(s,number(value,1),x+(horizontal?0:scale+12),y+(horizontal?scale+22:4),'#e5ddf0',11,horizontal?'center':'left');});
        summary(s,`Our slice is w = ${number(w)}. ${r===null?'No intersection: the 4D ball is beyond our slice.':`The visible solid 3D ball has radius √(1 − ${number(w)}²) = ${number(r)}.`} At w = 0 it reaches radius 1. This is the same slicing rule as Flatland, one dimension up; a fourth spatial coordinate is not time in this example.`);
    }
    function renderFeatures(s,W,H) {
        const [a,b]=panels(W,H),values=s.state.values,x=Number(s.state.x),y=Number(s.state.y),scale=Math.min(a.w*.33,a.h*.3),center=[a.x+a.w/2,a.y+a.h*.5];
        for(let i=-2;i<=2;i++){line(s,[center[0]-scale,center[1]+i*scale/2],[center[0]+scale,center[1]+i*scale/2],'#aaa4ce30',1);line(s,[center[0]+i*scale/2,center[1]-scale],[center[0]+i*scale/2,center[1]+scale],'#aaa4ce30',1);}
        line(s,[center[0]-scale,center[1]],[center[0]+scale,center[1]],'#94adff',1.5);line(s,[center[0],center[1]-scale],[center[0],center[1]+scale],'#94adff',1.5);
        text(s,`${names[x]} →`,center[0],center[1]+scale+22,'#e5ddf0',11,'center');text(s,names[y],a.x+12,a.y+48,'#e5ddf0',11);text(s,'A TWO-COORDINATE WINDOW',a.x+14,a.y+24,'#ff9479',11);
        circle(s,center,9,'#68e4ff');dot(s,[center[0]+values[x]*scale,center[1]-values[y]*scale],'#ff9479',5);
        const rc=[b.x+b.w/2,b.y+b.h*.57],radius=Math.min(b.w*.25,b.h*.3),polygon=values.map((v,i)=>[rc[0]+Math.cos(-Math.PI/2+i*tau/6)*radius*(v+1)/2,rc[1]+Math.sin(-Math.PI/2+i*tau/6)*radius*(v+1)/2]);
        for(let level=1;level<=3;level++){const points=values.map((_,i)=>[rc[0]+Math.cos(-Math.PI/2+i*tau/6)*radius*level/3,rc[1]+Math.sin(-Math.PI/2+i*tau/6)*radius*level/3]);points.forEach((p,i)=>line(s,p,points[(i+1)%6],'#9a8cba50',1));}
        const reference=values.map((_,i)=>[rc[0]+Math.cos(-Math.PI/2+i*tau/6)*radius/2,rc[1]+Math.sin(-Math.PI/2+i*tau/6)*radius/2]);reference.forEach((p,i)=>line(s,p,reference[(i+1)%6],'#68e4ff',1.4,true));
        fill(s,polygon,'#ff94793a');polygon.forEach((p,i)=>line(s,p,polygon[(i+1)%6],colors[i],2.3));
        names.forEach((name,i)=>{const angle=-Math.PI/2+i*tau/6,p=[rc[0]+Math.cos(angle)*radius,rc[1]+Math.sin(angle)*radius];line(s,rc,p,colors[i]+'80',1);dot(s,polygon[i],colors[i],3);text(s,name,rc[0]+Math.cos(angle)*(radius+18),rc[1]+Math.sin(angle)*(radius+18)+4,colors[i],11,'center');});
        text(s,'SIX SCORES, ONE RECIPE',b.x+b.w/2,b.y+24,'#ff9479',11,'center');
        const full=C.distance(values,[0,0,0,0,0,0]),map=Math.hypot(values[x],values[y]);
        summary(s,`Coordinates: (${values.map(v=>number(v,1)).join(', ')}). Full 6D distance from the reference = ${number(full)}. Radar: center = −1, halfway = 0 (dashed cyan), rim = +1. ${x===y?`Both map axes show ${names[x]}, so this window displays only one independent feature.`:`The ${names[x].toLowerCase()}–${names[y].toLowerCase()} window shows distance ${number(map)}.`} ${full>0&&map===0?'The map points overlap even though the smoothies differ in hidden features!':'A two-feature map cannot show the entire six-feature difference.'}`);
    }
    function renderEscape(s,W,H) {
        const p=C.bypass(s.state.progress),ground=[[-.85,0,-.85],[.85,0,-.85],[.85,0,.85],[-.85,0,.85]],project=camera(s,[...ground,[1.8,0,0],[0,1.2,0]],{x:0,y:0,w:W,h:H});
        fill(s,ground.map(project),'#ff94791a');ground.forEach((v,i)=>line(s,project(v),project(ground[(i+1)%4]),'#ff9479',3));
        const path=Array.from({length:81},(_,i)=>{const v=C.bypass(i/80);return project([v[0],v[2],v[1]])});for(let i=0;i<80;i++)line(s,path[i],path[i+1],'#ffd47775',1.6,true);
        const point=project([p[0],p[2],p[1]]),foot=project([p[0],0,p[1]]);line(s,point,foot,'#69efc0',1.5,true);dot(s,foot,'#8cb5c0',3);circle(s,project([1.8,0,0]),9,'#69efc0',true);dot(s,point,'#ffd477',8);
        text(s,'INK BOUNDARY · z = 0 SHEET',18,28,'#ff9479',11);
        const phase=s.state.progress<.3?'LIFT':s.state.progress<.7?'TRAVEL ABOVE THE SHEET':'LAND OUTSIDE';text(s,phase,18,H-20,'#ffd477',13);
        summary(s,`${phase}: position (x, y, z) = (${p.map(v=>number(v)).join(', ')}). ${p[2]>0?'The traveler leaves the sheet: z is positive, so it can pass above the ink boundary.':p[0]===0?'The traveler starts inside the ink boundary on the sheet.':'The traveler is back on the sheet, beyond the boundary.'} The flat shadow can cross the ink while the actual 3D path never touches it.`);
    }
    const renderers={ladder:renderLadder,slice:renderSlice,shadow:renderShadow,tesseract:renderTesseract,net:renderNet,hypersphere:renderHypersphere,features:renderFeatures,escape:renderEscape};
    window.syncDimensions=mode=>{active=mode==='dimensions';scenes.forEach(s=>{s.dirty=true});};
    let last=performance.now();
    function tick(now) {
        const dt=Math.min((now-last)/1000,.05);last=now;
        if(active&&!document.hidden) for(const s of scenes) {
            if(!s.visible&&!s.dirty)continue;if(!s.canvas.clientWidth||!s.canvas.clientHeight)continue;
            const moving=s.visible&&s.orbit&&s.kind!=='features'&&!window.areWorksheetAnimationsPaused();
            if(moving){s.yaw+=dt*.14;s.dirty=true;}
            if(s.dirty){const size=begin(s);if(size){renderers[s.kind](s,size.W,size.H);s.dirty=false;}}
        }
        requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
})();
