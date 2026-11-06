// Native scrolling keeps touch, keyboard and reduced-motion browsing consistent.
export function enhanceCarousels(root=document){
 const mobile=matchMedia('(max-width: 767px)');
 const cleanups=[];
 const selector='.s-scope-grid,.pd-studio-notes,.cards-3,.cards-2,.svc-cards,.plans,.work,.vtest,.industries,.awards__grid,.products-index-grid,.np-sticky-cards,.pd-how-map>.max-w-6xl>div,.pd-circuit [data-circuit-cards]';
 root.querySelectorAll(selector).forEach((rail,index)=>{
  if(rail.dataset.carouselReady||rail.children.length<2)return;
  // React islands enhance only after hydration, through their own lifecycle.
  if(rail.closest('.pd-island')&&!root.classList?.contains('pd-component'))return;
  rail.dataset.carouselReady='true';rail.classList.add('n-carousel');
  const label=rail.closest('section')?.querySelector('h2,h1')?.textContent.trim()||'Explore cards';
  const controls=document.createElement('div');controls.className='n-carousel-controls';
  const previous=document.createElement('button'),next=document.createElement('button'),status=document.createElement('span');
  previous.type=next.type='button';previous.textContent='←';next.textContent='→';
  previous.setAttribute('aria-label','Previous card');next.setAttribute('aria-label','Next card');
  if(!rail.id)rail.id='carousel-'+(root.closest?.('.pd-island')?.id||root.id||'page')+'-'+index;
  previous.setAttribute('aria-controls',rail.id);next.setAttribute('aria-controls',rail.id);
  status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  controls.append(status,previous,next);rail.after(controls);
  const items=()=>[...rail.children].filter(el=>el.matches(':not(svg)')&&getComputedStyle(el).display!=='none');
  function update(){
   const cards=items(),left=rail.getBoundingClientRect().left;
   const active=cards.reduce((best,el,i)=>Math.abs(el.getBoundingClientRect().left-left)<Math.abs(cards[best].getBoundingClientRect().left-left)?i:best,0);
   status.textContent=`${Math.min(active+1,cards.length)} / ${cards.length}`;
   previous.disabled=rail.scrollLeft<2;next.disabled=rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-2;
   if(mobile.matches){rail.setAttribute('tabindex','0');rail.setAttribute('role','region');rail.setAttribute('aria-label',label+' — swipe to explore');}
   else{rail.removeAttribute('tabindex');rail.removeAttribute('role');rail.removeAttribute('aria-label');}
  }
  function move(direction){const cards=items(),left=rail.getBoundingClientRect().left;const nearest=cards.reduce((best,el)=>Math.abs(el.getBoundingClientRect().left-left)<Math.abs(best.getBoundingClientRect().left-left)?el:best,cards[0]);if(!nearest)return;const target=cards[Math.max(0,Math.min(cards.length-1,cards.indexOf(nearest)+direction))];rail.scrollTo({left:rail.scrollLeft+target.getBoundingClientRect().left-left,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  previous.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));
  const key=event=>{if(event.target!==rail||!mobile.matches)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}};
  rail.addEventListener('keydown',key);rail.addEventListener('scroll',update,{passive:true});
  const resize=new ResizeObserver(update);resize.observe(rail);
  const filtered=new MutationObserver(update);filtered.observe(rail,{subtree:true,attributes:true,attributeFilter:['style','hidden']});
  mobile.addEventListener('change',update);update();
  cleanups.push(()=>{controls.remove();resize.disconnect();filtered.disconnect();mobile.removeEventListener('change',update);rail.removeEventListener('scroll',update);rail.removeEventListener('keydown',key);delete rail.dataset.carouselReady;rail.classList.remove('n-carousel');});
 });
 return()=>cleanups.forEach(clean=>clean());
}
