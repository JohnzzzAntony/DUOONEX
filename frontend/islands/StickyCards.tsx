/* Skiper 17 StickyCard_002 — inspired rebuild by @gurvinder-singh02; https://gxuri.me. Free version requires attribution to Skiper UI. */
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from './content';
gsap.registerPlugin(ScrollTrigger);
export default function StickyCards({paused}:{paused:boolean}){
 const root=useRef<HTMLDivElement>(null);
 useGSAP(()=>{
  if(paused||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const media=gsap.matchMedia();
  media.add('(min-width: 992px)',()=>{
   const container=root.current,images=gsap.utils.toArray<HTMLImageElement>('[data-sticky-image]',container!);if(!container||images.length<2)return;
   gsap.set(images[0],{yPercent:0,scale:1,rotation:0});gsap.set(images.slice(1),{yPercent:100,scale:1,rotation:0});
   const timeline=gsap.timeline({scrollTrigger:{trigger:container,start:'top top',end:()=>'+='+innerHeight*(images.length-1),pin:true,scrub:.5,pinSpacing:true,invalidateOnRefresh:true}});
   images.slice(0,-1).forEach((image,index)=>{timeline.to(image,{scale:.7,rotation:5,duration:1,ease:'none'},index).to(images[index+1],{yPercent:0,duration:1,ease:'none'},index);});
   const resize=new ResizeObserver(()=>ScrollTrigger.refresh());resize.observe(container);
   return()=>{resize.disconnect();timeline.scrollTrigger?.kill();timeline.kill();};
  });
  return()=>media.revert();
 },{scope:root,dependencies:[paused],revertOnUpdate:true});
 return <div ref={root} className="np-sticky-cards n-carousel">{projects.map(project=><img data-sticky-image key={project.id} src={project.image} alt={project.imageAlt} width="1200" height="900" loading="lazy" decoding="async"/>)}</div>;
}
