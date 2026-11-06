import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(ScrollTrigger);
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

export function createMotion({isPaused,home}){
 let context,observer,lenis,tick,cleanups=[];
 let initialHashHandled=false;
 const root=document.documentElement;
 function disposeScenes(){
  observer?.disconnect();context?.revert();context=null;
  cleanups.forEach(clean=>clean());cleanups=[];
  if(lenis){gsap.ticker.remove(tick);lenis.destroy();lenis=null;}
  root.classList.remove('roveia-motion-active');
 }
 function update(){
  disposeScenes();root.classList.toggle('studio-motion-paused',isPaused());
  if(isPaused()){$$('[data-count]').forEach(el=>el.textContent=el.dataset.count);return;}
  root.classList.add('roveia-motion-active');
  context=gsap.context(()=>{
   observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
     if(!entry.isIntersecting)continue;
     observer.unobserve(entry.target);
     context.add(()=>gsap.fromTo(entry.target,{y:22,opacity:0},{y:0,opacity:1,duration:.7,ease:'power3.out',clearProps:'transform,opacity'}));
    }
   },{rootMargin:'0px 0px -5% 0px'});
   $$('.s-reveal:not(.s-feature)').forEach(el=>observer.observe(el));
   if(!home)return;
   const media=gsap.matchMedia();
   media.add('(min-height: 680px)',()=>{
    // Supplied StickyCard_001 progression, shared with the site's existing Lenis clock.
    const stack=$('#capabilities'),cards=$$('.s-feature',stack);
    const credit=document.createElement('a');credit.href='https://skiper-ui.com/';credit.textContent='Card-stack motion · Skiper UI';credit.className='n-stack-credit';stack.append(credit);
    cards.forEach((card,index)=>{
     gsap.to(card,{scale:Math.max(.5,1-(cards.length-index-1)*.1),ease:'none',scrollTrigger:{trigger:stack,start:()=>`top top-=${index*stack.offsetHeight*.25}`,end:'bottom bottom',scrub:.5,invalidateOnRefresh:true}});
    });
    stack.dataset.motionScene='sticky-card-stack';
    return()=>{credit.remove();};
   });
   media.add('(min-width: 992px)',()=>{
    // Roveia: compact media expands into the rounded hero while pinned.
    const hero=$('.s-hero'),frame=$('.s-workflow-wrap'),window=$('.s-workflow');
    const overlay=document.createElement('div');overlay.className='r-hero-overlay';overlay.setAttribute('aria-hidden','true');window.append(overlay);
    cleanups.push(()=>overlay.remove());
    gsap.set(frame,{xPercent:-50,x:0,transformOrigin:'center center'});
    const heroScene=gsap.timeline({scrollTrigger:{trigger:hero,start:'top top',end:()=>'+='+innerHeight*1.1,pin:true,scrub:1,anticipatePin:1,invalidateOnRefresh:true}});
    heroScene.to(frame,{scale:()=>Math.max(hero.clientWidth/frame.clientWidth,hero.clientHeight/window.clientHeight)+.03,y:()=>hero.clientHeight/2-(frame.offsetTop+window.clientHeight/2),duration:1,ease:'none'},0)
     .to(overlay,{opacity:.68,duration:1,ease:'none'},0)
     .to('.s-hero h1,.s-hero h1 em,.s-hero-description,.s-hero-bottom',{color:'#ffffff',duration:.7,ease:'none'},.15)
     .to('.s-beta',{color:'#fff',backgroundColor:'#163125',borderColor:'#ffffff55',duration:.6,ease:'none'},.2);
    hero.dataset.motionScene='expanding-media';
    // Portfolio panels settle over their predecessor as in the reference.
    const projects=$$('.s-project');
    projects.forEach((project,index)=>{
     project.style.zIndex=String(index+1);
     if(index<projects.length-1)gsap.to(project,{scale:.965,scrollTrigger:{trigger:projects[index+1],start:'top 85%',end:'top 18%',scrub:true},ease:'none'});
    });
    cleanups.push(()=>projects.forEach(project=>project.style.removeProperty('z-index')));
    // Horizontal scroll-scrubbed service rail, with a keyboard focus equivalent.
    const rail=$('.s-scope-grid');let stage=rail.parentElement;
    if(!stage.classList.contains('r-scope-stage')){stage=document.createElement('div');stage.className='r-scope-stage';rail.before(stage);stage.append(rail);}
    const distance=()=>Math.max(0,rail.scrollWidth-stage.clientWidth);
    const railScene=gsap.to(rail,{x:()=>-distance(),ease:'none',scrollTrigger:{trigger:stage,start:'center center',end:()=>'+='+Math.max(700,distance()*2),pin:true,scrub:1,invalidateOnRefresh:true,anticipatePin:1}}).scrollTrigger;
    const focusRail=event=>{const index=$$('.s-scope-card',rail).indexOf(event.target.closest('.s-scope-card'));if(index>=0)lenis?.scrollTo(railScene.start+(railScene.end-railScene.start)*index/2,{immediate:true,force:true});};
    rail.addEventListener('focusin',focusRail);cleanups.push(()=>rail.removeEventListener('focusin',focusRail));stage.dataset.motionScene='horizontal-services';
    lenis=new Lenis({duration:1.2,smoothWheel:true,syncTouch:false,anchors:false,prevent:node=>node.closest('.s-mobile-nav')});
    lenis.on('scroll',ScrollTrigger.update);tick=time=>lenis?.raf(time*1000);gsap.ticker.add(tick);
    return ()=>{cleanups.forEach(clean=>clean());cleanups=[];if(lenis){gsap.ticker.remove(tick);lenis.destroy();lenis=null;}};
   });
   gsap.from('.s-quality-bars>div',{scaleY:0,duration:.65,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:'.s-quality-card',start:'top 85%',once:true}});
  });
  ScrollTrigger.refresh();root.dataset.referenceMotion='ready';
  if(!initialHashHandled){initialHashHandled=true;const target=document.getElementById(location.hash.slice(1));if(target)scrollTo(target,true);}
 }
 function scrollTo(target,immediate=false){
  const destination=Math.max(0,target.getBoundingClientRect().top+window.scrollY-110);
  if(lenis&&!isPaused())lenis.scrollTo(destination,{immediate,force:true});
  else window.scrollTo({top:destination,behavior:immediate||isPaused()?'instant':'smooth'});
 }
 update();return {update,scrollTo,dispose:disposeScenes};
}
