import {WebGLRenderer,Scene,OrthographicCamera,BufferGeometry,Float32BufferAttribute,ShaderMaterial,LineSegments,Points,AdditiveBlending,CatmullRomCurve3,Vector3,Color} from 'three';

export function createLightStream(host,initiallyPaused){
 if(!host)return null;
 let renderer;
 try{renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return null;}
 const low=innerWidth<768||(navigator.hardwareConcurrency||8)<=4;
 renderer.setPixelRatio(Math.min(devicePixelRatio,low?1:1.5));
 renderer.setSize(innerWidth,innerHeight);renderer.setClearColor(0,0);
 host.append(renderer.domElement);host.classList.add('is-ready');
 const scene=new Scene(),camera=new OrthographicCamera(-1,1,1,-1,0,2);camera.position.z=1;
 const curves=[
  [[-1.3,-1],[-.8,-.8],[-.25,-.42],[.15,.18],[.65,.12],[1.3,.65]],
  [[-1.3,-.65],[-.8,-.3],[-.2,.05],[.3,.15],[.7,.5],[1.3,.7]],
  [[-1.3,-.12],[-.8,.02],[-.3,.15],[.3,-.1],[.8,.06],[1.3,.13]]
 ].map(points=>new CatmullRomCurve3(points.map(([x,y])=>new Vector3(x,y,0))));
 const count=low?90:180,samples=80,hero=[],mid=[],wave=[],offset=[],colors=[];
 const sampledCurves=curves.map(curve=>curve.getPoints(samples-1));
 const lime=new Color('#c6f24e'),cyan=new Color('#59c3e8'),yellow=new Color('#b4c936');
 for(let strand=0;strand<count;strand++){
  const shift=(strand-count/2)/count*.18,phase=strand*.317;
  const color=strand%7===0?cyan:lime.clone().lerp(yellow,(strand%11)/18);
  for(let sample=0;sample<samples-1;sample++){
   for(const index of [sample,sample+1]){
    const t=index/(samples-1),p=sampledCurves.map(points=>points[index]);
    hero.push(p[0].x,p[0].y);mid.push(p[1].x,p[1].y);wave.push(p[2].x,p[2].y);
    offset.push(shift,phase,t);colors.push(color.r,color.g,color.b);
   }
  }
 }
 const geometry=new BufferGeometry();
 geometry.setAttribute('position',new Float32BufferAttribute(new Float32Array(hero.length/2*3),3));
 geometry.setAttribute('aHero',new Float32BufferAttribute(hero,2));geometry.setAttribute('aMid',new Float32BufferAttribute(mid,2));geometry.setAttribute('aWave',new Float32BufferAttribute(wave,2));geometry.setAttribute('aOffset',new Float32BufferAttribute(offset,3));geometry.setAttribute('aColor',new Float32BufferAttribute(colors,3));
 const uniforms={uTime:{value:0},uProgress:{value:0},uOpacity:{value:1},uAspect:{value:innerWidth/innerHeight}};
 const material=new ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:AdditiveBlending,
  vertexShader:`attribute vec2 aHero;attribute vec2 aMid;attribute vec2 aWave;attribute vec3 aOffset;attribute vec3 aColor;uniform float uTime;uniform float uProgress;uniform float uAspect;varying vec3 vColor;varying float vAlpha;void main(){float mid=smoothstep(0.03,0.25,uProgress);float wave=smoothstep(0.56,0.76,uProgress);vec2 p=mix(mix(aHero,aMid,mid),aWave,wave);float spread=mix(1.,2.2,mid)*(1.-wave*.6);p.y+=aOffset.x*spread+sin(aOffset.z*8.+aOffset.y+uTime*.94)*.012;p.x+=sin(aOffset.z*6.+aOffset.y)*.006;vColor=aColor;vAlpha=(.14+.12*sin(aOffset.y))*(1.-mid*.65+wave*.5)*(1.-smoothstep(.87,1.,uProgress));gl_Position=vec4(p,0.,1.);}`,
  fragmentShader:`varying vec3 vColor;varying float vAlpha;uniform float uOpacity;void main(){gl_FragColor=vec4(vColor,vAlpha*uOpacity);}`
 });
 scene.add(new LineSegments(geometry,material));
 const particleCount=low?180:400,positions=[];
 for(let i=0;i<particleCount;i++)positions.push(Math.sin(i*17.23),Math.cos(i*12.73),i%5);
 const particles=new BufferGeometry();particles.setAttribute('position',new Float32BufferAttribute(positions,3));
 const particleMaterial=new ShaderMaterial({uniforms,transparent:true,depthWrite:false,blending:AdditiveBlending,
  vertexShader:`uniform float uTime;attribute vec3 position;varying float vFade;void main(){vec2 p=position.xy;p.y+=sin(uTime*.15+position.z)*.03;vFade=.15+position.z*.06;gl_Position=vec4(p,0.,1.);gl_PointSize=1.+position.z*.8;}`.replace('attribute vec3 position;',''),
  fragmentShader:`varying float vFade;uniform float uProgress;void main(){float d=length(gl_PointCoord-.5);float alpha=smoothstep(.5,.08,d)*vFade*(1.-smoothstep(.85,1.,uProgress));gl_FragColor=vec4(.65,.83,.32,alpha);}`
 });
 scene.add(new Points(particles,particleMaterial));
 let paused=initiallyPaused,disposed=false,started=performance.now(),previous=started,average=16.7,frames=0,quality=0;
 const draw=time=>{
  const elapsed=time-previous;previous=time;
  if(elapsed>0&&elapsed<200){average=average*.94+elapsed*.06;frames++;}
  // Preserve a smooth interface on software renderers and slower integrated GPUs.
  // Fast devices retain all 180 strands; slow devices progressively reduce fill work.
  if(!paused&&frames>60&&average>24&&quality===0){
   quality=1;renderer.setPixelRatio(Math.min(devicePixelRatio,1));renderer.setSize(innerWidth,innerHeight);
   geometry.setDrawRange(0,Math.floor(count/2)*(samples-1)*2);particles.setDrawRange(0,Math.floor(particleCount/2));frames=0;
  }else if(!paused&&frames>90&&average>30&&quality===1){
   quality=2;renderer.setPixelRatio(.75);renderer.setSize(innerWidth,innerHeight);
   geometry.setDrawRange(0,Math.floor(count/3)*(samples-1)*2);particles.setDrawRange(0,Math.floor(particleCount/3));
  }
  uniforms.uTime.value=(time-started)/1000;renderer.render(scene,camera);
 };
 const loop=()=>{
  if(disposed)return;
  renderer.setAnimationLoop(paused||document.hidden?null:draw);
  if(!document.hidden)draw(performance.now());
 };
 const resize=()=>{renderer.setSize(innerWidth,innerHeight);uniforms.uAspect.value=innerWidth/innerHeight;if(paused)draw(performance.now());};
 addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',loop);
 const contextLost=event=>{event.preventDefault();renderer.setAnimationLoop(null);host.classList.remove('is-ready');};
 renderer.domElement.addEventListener('webglcontextlost',contextLost);
 loop();
 return {
  setProgress(progress){if(!paused)uniforms.uProgress.value=progress;},
  setPaused(value){paused=value;loop();},
  dispose(){disposed=true;renderer.setAnimationLoop(null);removeEventListener('resize',resize);document.removeEventListener('visibilitychange',loop);renderer.domElement.removeEventListener('webglcontextlost',contextLost);geometry.dispose();material.dispose();particles.dispose();particleMaterial.dispose();renderer.dispose();renderer.domElement.remove();}
 };
}
