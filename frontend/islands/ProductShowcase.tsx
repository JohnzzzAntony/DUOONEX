import { useEffect, useRef, useState, type CSSProperties } from 'react';
import websites from '../../data/website-projects.json';

const products = [
 {id:'finora',title:'Finora',description:'A UAE-focused accounting platform connecting sales, purchases, inventory, banking and ledger-based business reports.',image:'/assets/images/projects/finora-mockup-1.webp',href:'/case-studies/finora/'},
 {id:'nexora',title:'Nexora',description:'A shared workspace for support tickets, tasks, approvals and customer service, with organisation-scoped access and activity history.',image:'/assets/images/projects/nexora-mockup-1.webp',href:'/case-studies/nexora/'},
 {id:'invitara',title:'Invitara',description:'Animated digital invitations with personalisation, guest replies, account-based publishing and event-date access rules.',image:'/assets/images/projects/invitara-mockup-1.webp',href:'/case-studies/invitara/'},
 {id:'mechaura',title:'Mechaura International',description:'An industrial catalogue website connecting UAE buyers with product specifications, sector information and quotation enquiries.',image:'/assets/images/projects/mechaura-mockup-1.webp',href:'/case-studies/mechaura/'},
 {id:'workflow-hub',title:'WorkFlow Hub',description:'An internal tool that turns incoming emails into owned tasks, drafts professional replies and chases work until it is closed.',image:'/assets/images/projects/workflow-hub-mockup-1.webp',href:'/case-studies/workflow-hub/'},
 {id:'drec-pms',title:'DREC Property Management System',description:'A property and lease platform managing plots, units, subtenants, subleases, EJARI registrations, rent collection and compliance alerts.',image:'/assets/images/projects/drec-pms-mockup-1.webp',href:'/case-studies/drec-pms/'},
 {id:'certguard',title:'CertGuard',description:'A domain and SSL control panel that verifies expiry dates against live sources, alerts before expiry and automates certificate renewal.',image:'/assets/images/projects/certguard-mockup-1.webp',href:'/case-studies/certguard/'},
 ...websites.products
];

export default function ProductShowcase({paused=false}:{paused?:boolean}){
 const root=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null);
 const [enhanced,setEnhanced]=useState(false),[active,setActive]=useState(0);
 useEffect(()=>{
  const media=matchMedia('(min-width: 768px) and (min-height: 700px) and (prefers-reduced-motion: no-preference), (min-height: 800px) and (prefers-reduced-motion: no-preference)');
  const update=()=>setEnhanced(media.matches&&!paused);
  media.addEventListener('change',update);update();
  return()=>media.removeEventListener('change',update);
 },[paused]);
 useEffect(()=>{
  if(!enhanced)return;
  let frame=0;
  const update=()=>{
   frame=0;const track=root.current,panel=stage.current;if(!track||!panel)return;
   const distance=track.offsetHeight-panel.offsetHeight;
   const progress=Math.max(0,Math.min(1,(120-track.getBoundingClientRect().top)/distance));
   setActive(Math.round(progress*(products.length-1)));
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);update();
  return()=>{removeEventListener('scroll',schedule);removeEventListener('resize',schedule);cancelAnimationFrame(frame);};
 },[enhanced]);
 const goTo=(index:number)=>{
  const track=root.current,panel=stage.current;if(!track||!panel)return;
  const distance=track.offsetHeight-panel.offsetHeight;
  window.scrollTo({top:scrollY+track.getBoundingClientRect().top-120+index*distance/(products.length-1),behavior:'smooth'});
 };
 return <section ref={root} className="np-product-scroll" data-enhanced={enhanced?'true':undefined} data-active-product={active} style={{'--product-count':products.length} as CSSProperties} aria-label="Selected products">
  <div ref={stage} className="np-product-stage">
   <div className="np-product-heading"><h2>Our products<span>.</span></h2><span>Selected platforms / live demos</span></div>
   <div className="np-product-panels">{products.map((product,index)=>{
    const external=product.href.startsWith('https:');
    return <article key={product.id} className="np-product-panel" data-active={index===active?'true':undefined} aria-hidden={enhanced&&index!==active?true:undefined} inert={enhanced&&index!==active?true:undefined}>
     <div className="np-product-copy"><span className="np-product-number">{String(index+1).padStart(2,'0')} / {String(products.length).padStart(2,'0')} — {external?'Live demo':'Selected product'}</span><h3>{product.title}</h3><p>{product.description}</p><a className="np-product-link" href={product.href} {...(external?{target:'_blank',rel:'noopener noreferrer'}:{})}>{external?'Explore live demo':'View product details'} <span aria-hidden="true">↗</span></a></div>
     <figure className="np-product-image"><img src={product.image} alt={product.title+(external?' live website screenshot':' product interface')} width="1200" height={external?'833':'900'} loading="lazy" decoding="async"/><figcaption>{external?'Captured from the live website':'Product overview'}</figcaption></figure>
    </article>;
   })}</div>
   {enhanced&&<nav className="np-product-controls" aria-label="Product navigation"><span className="np-scroll-hint">Scroll to explore <span aria-hidden="true">↓</span></span><div className="np-product-dots">{products.map((product,index)=><button key={product.id} type="button" aria-label={'Show '+product.title} aria-current={index===active?'step':undefined} onClick={()=>goTo(index)}><span/></button>)}</div><div className="np-product-arrows"><button type="button" aria-label="Previous product" disabled={active===0} onClick={()=>goTo(active-1)}>←</button><button type="button" aria-label="Next product" disabled={active===products.length-1} onClick={()=>goTo(active+1)}>→</button></div></nav>}
  </div>
 </section>;
}
