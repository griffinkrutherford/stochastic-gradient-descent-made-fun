const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../dimensions-core');
test('hypercube adjacency is exactly one independent-coordinate change', () => {
    for(let n=0;n<=6;n++) {
        const {vertices,edges}=C.hypercube(n);
        assert.equal(vertices.length,2**n);assert.equal(edges.length,n*2**Math.max(0,n-1));
        for(const [a,b,axis] of edges) {assert.equal(vertices[a].filter((x,i)=>x!==vertices[b][i]).length,1);assert.notEqual(vertices[a][axis],vertices[b][axis]);}
        assert.equal(new Set(edges.map(([a,b])=>`${a}:${b}`)).size,edges.length);
    }
});
test('4D rotations preserve all distances, including each tesseract edge length', () => {
    const {vertices,edges}=C.hypercube(4);
    for(const axis of [0,1,2])for(const angle of [0,.5,Math.PI/2,Math.PI]) {
        const rotated=vertices.map(p=>C.rotate(p,axis,3,angle));
        rotated.forEach((p,i)=>assert(Math.abs(C.distance(p,[0,0,0,0])-C.distance(vertices[i],[0,0,0,0]))<1e-12));
        edges.forEach(([a,b])=>assert(Math.abs(C.distance(rotated[a],rotated[b])-2)<1e-12));
    }
});
test('projection changes appearance while preserving coordinate data', () => {
    const original=[1,1,1,-1];assert.deepEqual(C.project4(original,4),[.8,.8,.8]);assert.deepEqual(original,[1,1,1,-1]);
    assert.deepEqual(C.project4([1,1,1,1],4,true),C.project4(original,4,true));
    assert.throws(()=>C.project4([1,1,1,4],4),RangeError);
});
test('both unit-ball slice analogies have exact radii and no imaginary sections', () => {
    assert.equal(C.sliceRadius(0),1);assert.equal(C.sliceRadius(1),0);assert.equal(C.sliceRadius(-1),0);
    assert(Math.abs(C.sliceRadius(.6)-.8)<1e-12);assert.equal(C.sliceRadius(1.2),null);
    for(let a=-1;a<=1;a+=.01)assert(Math.abs(C.sliceRadius(a)**2+a*a-1)<1e-12);
});
test('the net has eight distinct cubes attached along faces', () => {
    assert.equal(C.cubeNet.length,6);assert.equal(C.tesseractNet.length,8);
    assert.equal(new Set(C.tesseractNet.map(p=>p.join(','))).size,8);
    C.tesseractNet.slice(1).forEach(p=>assert(C.tesseractNet.some(q=>q!==p&&p.reduce((a,v,i)=>a+Math.abs(v-q[i]),0)===1)));
});
test('hidden coordinates can separate points whose 2D projections coincide', () => {
    const a=[0,0,1,0,0,0],b=[0,0,0,0,0,0];assert.equal(C.distance(a,b),1);assert.equal(C.distance(a.slice(0,2),b.slice(0,2)),0);
});
test('the extra-direction path starts inside, ends outside, and never touches the ink', () => {
    assert.deepEqual(C.bypass(0),[0,0,0]);assert.deepEqual(C.bypass(1),[1.8,0,0]);
    for(let i=0;i<=1000;i++) {const [x,y,z]=C.bypass(i/1000);assert.equal(y,0);if(Math.abs(x-.85)<.03)assert(z>1);if(z===0)assert(x===0||x>.85);}
});
test('squared distance is accounted for once per independent visible axis', () => {
    const values=[.7,-.4,.8,.2,.5,-.6], original=values.slice();
    for(let x=0;x<6;x++)for(let y=0;y<6;y++) {
        const budget=C.distanceBudget(values,x,y);
        assert(Math.abs(budget.total-budget.visible-budget.hidden)<1e-12);
        assert(Math.abs(budget.total-C.distance(values,values.map(()=>0))**2)<1e-12);
        if(x===y)assert.equal(budget.visible,values[x]**2);
    }
    assert.deepEqual(values,original);
    const hidden=C.distanceBudget([0,0,1,0,0,0],0,1);assert.equal(hidden.visible,0);assert.equal(hidden.hidden,1);
});
test('a six-coordinate improvement reduces loss by the squared step factor', () => {
    const values=[.7,-.4,.8,.2,.5,-.6],step=C.recipeStep(values);
    assert(Math.abs(step[0]-.525)<1e-12);assert.deepEqual(values,[.7,-.4,.8,.2,.5,-.6]);
    assert(Math.abs(C.distanceBudget(step,0,1).loss/C.distanceBudget(values,0,1).loss-.5625)<1e-12);
    assert.throws(()=>C.recipeStep(values,1.2),RangeError);
});
test('inner-ball volume fractions scale by dimension, not by radius alone', () => {
    assert.equal(C.innerVolumeFraction(1),.9);assert.equal(C.innerVolumeFraction(3),.9**3);
    assert(Math.abs(C.innerVolumeFraction(100)-.000026561398887587544)<1e-15);
    for(let n=1;n<100;n++)assert(C.innerVolumeFraction(n+1)<C.innerVolumeFraction(n));
    assert.throws(()=>C.innerVolumeFraction(0),RangeError);assert.throws(()=>C.innerVolumeFraction(3,1.2),RangeError);
});
