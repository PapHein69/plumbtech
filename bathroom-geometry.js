import * as T from './vendor/three/three.module.js';

// Modeled from the reference drawing; dimensions are illustrative, not construction specifications.
export function createBathroom() {
  const root=new T.Group();
  const ink=new T.LineBasicMaterial({color:0x73808a,transparent:true,opacity:.7});
  const ghost=new T.MeshBasicMaterial({color:0xe5ebef,transparent:true,opacity:.065,side:T.DoubleSide,depthWrite:false});
  const vec=p=>new T.Vector3(...p);
  function stroke(points,closed=false){const g=new T.BufferGeometry().setFromPoints(points.map(vec));const o=closed?new T.LineLoop(g,ink):new T.Line(g,ink);root.add(o);return o;}
  function mesh(g,p=[0,0,0],rot=[0,0,0]){const o=new T.Group();o.add(new T.Mesh(g,ghost),new T.LineSegments(new T.EdgesGeometry(g,35),ink));o.position.set(...p);o.rotation.set(...rot);root.add(o);return o;}
  // Smooth rounded-rectangle cross sections, joined into ceramic shells.
  function loft(cx,cz,sections,power=2){
    if(power<6){
      const original=sections;
      const curve=new T.CatmullRomCurve3(original.map(s=>new T.Vector3(s[0],s[1],s[2])),false,'centripetal');
      sections=Array.from({length:65},(_,i)=>{
        const t=i/64,p=curve.getPoint(t),f=t*(original.length-1),k=Math.min(Math.floor(f),original.length-2);
        const offset=T.MathUtils.lerp(original[k][3]||0,original[k+1][3]||0,f-k);
        return [p.x,p.y,p.z,offset];
      });
    }
    const n=64,vertices=[],indices=[],rings=[];
    sections.forEach(([y,rx,rz,offset=0])=>{
      const ring=[];
      for(let j=0;j<n;j++){const a=j/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a);const p=[cx+rx*Math.sign(c)*Math.abs(c)**(2/power),y,cz+offset+rz*Math.sign(s)*Math.abs(s)**(2/power)];vertices.push(...p);ring.push(p);}
      rings.push(ring);
    });
    for(let i=0;i<sections.length-1;i++)for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n;indices.push(a,b,a+n,b,b+n,a+n);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();root.add(new T.Mesh(g,ghost));
    rings.forEach((r,i)=>{if(i===0||i===rings.length-1||i===Math.floor(rings.length/2))stroke(r,true);});
    for(let j=0;j<n;j+=8)stroke(rings.map(r=>r[j]));
  }
  function pipe(points,r=.055){
    // Round elbows instead of bending long straight pipe runs.
    const path=new T.CurvePath();let current=vec(points[0]);
    for(let i=1;i<points.length-1;i++){
      const a=vec(points[i-1]),b=vec(points[i]),c=vec(points[i+1]);
      const trim=Math.min(.15,a.distanceTo(b)*.25,b.distanceTo(c)*.25);
      const entry=b.clone().add(a.clone().sub(b).normalize().multiplyScalar(trim));
      const exit=b.clone().add(c.clone().sub(b).normalize().multiplyScalar(trim));
      path.add(new T.LineCurve3(current,entry));path.add(new T.QuadraticBezierCurve3(entry,b,exit));current=exit;
    }
    path.add(new T.LineCurve3(current,vec(points.at(-1))));
    const g=new T.TubeGeometry(path,Math.max(24,points.length*16),r,12,false);root.add(new T.Mesh(g,ghost));
    // Four longitudinal outlines, plus end rings.
    const pos=g.attributes.position;
    for(let j=0;j<12;j+=3){const pts=[];for(let i=0;i<=g.parameters.tubularSegments;i++){const k=i*13+j;pts.push([pos.getX(k),pos.getY(k),pos.getZ(k)]);}stroke(pts);}
    for(const i of [0,g.parameters.tubularSegments]){const pts=[];for(let j=0;j<12;j++){const k=i*13+j;pts.push([pos.getX(k),pos.getY(k),pos.getZ(k)]);}stroke(pts,true);}
  }
  function collar(x,y,z,axis='y',r=.095){mesh(new T.CylinderGeometry(r,r,.13,24),[x,y,z],axis==='x'?[0,0,Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:[0,0,0]);}
  function tap(x,y,z){pipe([[x,y,z],[x,y+.33,z],[x,y+.4,z+.1],[x,y+.32,z+.3]],.052);mesh(new T.BoxGeometry(.12,.025,.27),[x,y+.39,z+.04]);collar(x,y+.03,z,'y',.09);}
  // Distinct left risers and paired horizontal mains behind the fixtures.
  [-4.8,-4.45].forEach((x,i)=>{
    const y=.8+i*.24,z=-.42-i*.16;
    pipe([[x,-.7,z],[x,5.9,z]],.065);
    pipe([[x,y,z],[4.1+i*.3,y,z],[4.1+i*.3,4.3,z]],.065);
    collar(x,y,z);collar(x+.22,y,z,'x');collar(4.1+i*.3,1.1,z);
    [-2.65,.8].forEach(f=>{pipe([[f+i*.17,y,z],[f+i*.17,1.65,z],[f+i*.17,1.65,.1]],.042);collar(f+i*.17,1.3,z,'y',.075);});
  });
  // Wall basin: rounded rectangular lip, cupped inner basin and drain trap.
  loft(-2.7,.32,[[1.55,.21,.18],[1.62,.45,.32],[1.8,.73,.46],[2.03,.92,.54],[2.15,.95,.55],[2.18,.94,.54],[2.15,.83,.45],[1.99,.69,.36],[1.85,.4,.22],[1.81,.09,.09]],3);
  tap(-2.7,2.18,-.08);
  pipe([[-2.7,1.82,.34],[-2.7,1.05,.34],[-2.7,.88,.52],[-2.4,.88,.52],[-2.4,1.15,.52],[-2.4,1.15,-.5]],.075);
  collar(-2.7,1.45,.34,'y',.105);
  // Toilet: shaped pedestal, swept bowl, seat and rounded cistern.
  loft(-.75,.6,[[.04,.4,.5],[.1,.42,.54],[.22,.34,.43],[.45,.27,.33,-.08],[.7,.35,.48],[.94,.49,.65],[1.13,.59,.76],[1.3,.6,.77]],2.6);
  loft(-.75,.64,[[1.29,.6,.76],[1.36,.62,.79],[1.41,.6,.77],[1.41,.47,.62],[1.33,.46,.61],[1.2,.42,.54],[1.03,.19,.25]],2.5);
  loft(-.75,-.05,[[1.15,.51,.25],[1.27,.55,.27],[2.15,.55,.27],[2.24,.51,.24],[2.26,.5,.23]],5);
  loft(-.75,-.05,[[2.24,.54,.27],[2.29,.55,.28],[2.32,.51,.25]],5);
  mesh(new T.CylinderGeometry(.065,.065,.02,24),[-.75,2.335,-.05]);
  pipe([[-.75,.92,.55],[-.75,.6,.55],[-.75,.45,.35],[-.75,.57,-.35]],.12);
  pipe([[-1.15,1.22,-.2],[-1.15,1,-.58]],.04);
  // Bidet: a continuous ceramic foot and bowl, rather than a basin on a cylinder.
  loft(.95,.45,[[.07,.27,.37],[.15,.3,.4],[.55,.34,.45],[.96,.44,.59],[1.39,.52,.68],[1.5,.54,.69],[1.53,.52,.67],[1.5,.43,.56],[1.29,.32,.41],[1.1,.09,.1]],2.6);
  tap(.95,1.53,-.01);pipe([[.95,1.13,.45],[.95,.72,.45],[1.12,.55,.45],[1.3,.7,.45],[1.3,.85,-.5]],.06);
  // One-piece ceramic shower tray with inner slope and drain grate.
  loft(3.35,1.0,[[.02,1.25,1.05],[.22,1.25,1.05],[.25,1.2,1],[.25,1.12,.92],[.13,1.05,.85],[.09,.15,.15]],16);
  mesh(new T.BoxGeometry(.31,.015,.31),[3.35,.105,1]);
  for(let i=-2;i<=2;i++)stroke([[3.35+i*.045,.116,.89],[3.35+i*.045,.116,1.11]]);
  pipe([[4.1,4.25,-.42],[4.4,4.25,-.58]],.12);
  pipe([[4.1,4.25,-.42],[4.1,6.02,-.42],[4.1,6.15,.08],[4.1,6.15,.57],[4.1,5.97,.65]],.065);
  mesh(new T.CylinderGeometry(.35,.43,.09,40),[4.1,5.94,.65]);
  return root;
}
