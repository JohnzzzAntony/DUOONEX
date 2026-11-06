import { Component, type ReactNode, useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { CircuitBoard } from '../../components/podie/cult--circuit-board/author/1/circuit-board';
import HowItWorks from '../../components/podie/chamaac--how-it-works/author/1/how-it-works';
import ProcessCardReveal from '../../components/podie/tween-ui--process-card-reveal/author/1/process-card-reveal';
import VerticalTabs from '../../components/podie/uselayouts--vertical-tabs/registry/default/example/vertical-tabs';
import StickyCards from './StickyCards';
import { capabilities, stages, projects, delivery } from './content';

export type IslandName='circuit'|'how'|'projects'|'delivery'|'vertical'|'sticky';
class IslandBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(error:Error){console.error('PODIE component error:',error);}
 render(){return this.state.failed?<p>Explore our <a href="/services/">services</a> or <a href="/contact/">contact the studio</a>.</p>:this.props.children;}
}
export function Island({name}:{name:IslandName}){
 const [motionPaused,setPaused]=useState(false),[localPaused,setLocalPaused]=useState(false),[visible,setVisible]=useState(true),[ready,setReady]=useState(false),root=useRef<HTMLDivElement>(null);
 const paused=motionPaused||localPaused||!visible;
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>setPaused(media.matches||document.documentElement.classList.contains('studio-motion-paused'));
  const observer=new MutationObserver(update);observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  const viewport=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{rootMargin:'100px 0px'});if(root.current)viewport.observe(root.current);
  media.addEventListener('change',update);update();setReady(true);
  return()=>{observer.disconnect();viewport.disconnect();media.removeEventListener('change',update);};
 },[]);
 useEffect(()=>{
  root.current?.querySelectorAll('svg').forEach(svg=>{if(paused)svg.pauseAnimations?.();else svg.unpauseAnimations?.();});
 },[paused,ready]);
 return <IslandBoundary><div ref={root} className={'pd-component pd-'+name} data-pd-ready={ready?'true':undefined} data-pd-paused={paused?'true':undefined}>
  <MotionConfig reducedMotion={paused?'always':'user'}>
   {name==='sticky'?<StickyCards paused={paused}/>:name==='vertical'?<VerticalTabs paused={paused}/>:name==='circuit'?<CircuitBoard items={capabilities} chipLabel="NexPixels" paused={paused}/>:name==='how'?<HowItWorks features={stages} className="pd-how-map" paused={paused}/>:<ProcessCardReveal steps={name==='projects'?projects:delivery} paused={paused} itemLabel={name==='projects'?'project':'step'} className="pd-card-reveal" aria-label={name==='projects'?'Selected NexPixels projects':'NexPixels delivery stages'}/>}
  </MotionConfig>
  {(name==='projects'||name==='delivery')&&<div className="pd-playback-controls">{ready&&!motionPaused?<button type="button" aria-pressed={localPaused} onClick={()=>setLocalPaused(value=>!value)}>{localPaused?'Resume playback':'Pause playback'}</button>:<span>Use the numbered controls to explore each {name==='projects'?'project':'stage'}.</span>}</div>}
 </div></IslandBoundary>;
}
