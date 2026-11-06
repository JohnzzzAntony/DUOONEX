import { enhanceCarousels } from './carousels';
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];

const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const home=document.body.classList.contains('studio-home');
enhanceCarousels(document.querySelector('main')||document);
const serviceGroups=[...document.querySelectorAll('.n-service-group')];
if(serviceGroups.length){
 const wide=matchMedia('(min-width: 768px)');
 const arrange=()=>serviceGroups.forEach((group,index)=>group.open=wide.matches||index===0);
 serviceGroups.forEach(group=>group.querySelector('summary').addEventListener('click',event=>{if(wide.matches)event.preventDefault();}));
 wide.addEventListener('change',arrange);arrange();
}
let manuallyPaused=false,motionController;
try{manuallyPaused=sessionStorage.getItem('studio-motion-paused')==='true';}catch{}
const isPaused=()=>reduce.matches||manuallyPaused;
// Menus use real links, Escape dismissal, and a contained keyboard focus order.
const toggle=$('.s-menu-toggle'),menu=$('.s-mobile-nav');
function setMenu(open){
 if(!menu||!toggle)return;
 menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));
 toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
 document.body.classList.toggle('s-menu-open',open);
 if(open)$('a',menu)?.focus();
}
toggle?.addEventListener('click',()=>setMenu(menu.hidden));
menu?.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false);});
document.addEventListener('keydown',event=>{
 if(!menu||menu.hidden)return;
 if(event.key==='Escape'){setMenu(false);toggle.focus();}
 if(event.key==='Tab'){
  const links=[toggle,...$$('a',menu)],index=links.indexOf(document.activeElement);
  if(event.shiftKey&&index<=0){event.preventDefault();links.at(-1).focus();}
  else if(!event.shiftKey&&index===links.length-1){event.preventDefault();toggle.focus();}
 }
});
matchMedia('(min-width: 992px)').addEventListener('change',event=>{if(event.matches)setMenu(false);});
$$('.s-desktop-nav a,.s-mobile-nav a').forEach(link=>{if(link.pathname===location.pathname||(link.pathname!=='/'&&location.pathname.startsWith(link.pathname)))link.setAttribute('aria-current','page');});
// Section links also work as normal URLs on every inner page and without JavaScript.
if(home){
 const sectionLinks=$$('[data-section-link]');
 const sections=$$('section[id]').filter(section=>sectionLinks.some(link=>link.hash==='#'+section.id));
 function activeSection(){
  const section=sections.filter(el=>el.getBoundingClientRect().top<=innerHeight*.4).at(-1);
  sectionLinks.forEach(link=>{if(section&&link.hash==='#'+section.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
 }
 let sectionFrame=0;
 addEventListener('scroll',()=>{if(!sectionFrame)sectionFrame=requestAnimationFrame(()=>{activeSection();sectionFrame=0;});},{passive:true});
 activeSection();
 function goToSection(hash){
  const target=document.getElementById(hash.slice(1));if(!target)return;
  if(motionController)motionController.scrollTo(target);
  else window.scrollTo({top:target.getBoundingClientRect().top+scrollY-110,behavior:isPaused()?'instant':'smooth'});
  target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target||link.download)return;
  if(link.origin!==location.origin||link.pathname!==location.pathname||!link.hash||!document.getElementById(link.hash.slice(1)))return;
  event.preventDefault();if(location.hash!==link.hash)history.pushState(null,'',link.hash);goToSection(link.hash);
 });
 addEventListener('popstate',()=>{if(location.hash)goToSection(location.hash);});
}
const header=$('.s-header');
const headerState=()=>header?.classList.toggle('is-scrolled',scrollY>10);
headerState();addEventListener('scroll',headerState,{passive:true});

// The scoping control carries its selection into the existing contact page.
const budget=$('#project-budget');
const budgetLabels=['AED 5k–15k','AED 15k–30k','AED 30k+'];
const budgetValues=['AED 5,000–15,000','AED 15,000–30,000','AED 30,000–60,000'];
if(budget){
 const update=()=>{
  const index=Number(budget.value);
  $('[data-budget-output]').textContent=budgetLabels[index];
  $('[data-budget-link]').href='/contact/?budget='+encodeURIComponent(budgetValues[index]);
  budget.setAttribute('aria-valuetext',budgetLabels[index]+' project budget');
  budget.style.background=`linear-gradient(90deg,var(--lime) ${index*50}%,#d3d7dc ${index*50}%)`;
 };
 budget.addEventListener('input',update);update();
}
const selectedBudget=new URLSearchParams(location.search).get('budget');
if(selectedBudget){const select=$('select[name=budget]');if(select&&[...select.options].some(option=>option.value===selectedBudget))select.value=selectedBudget;}
$$('.rail').forEach(element=>{element.tabIndex=0;element.setAttribute('role','region');element.setAttribute('aria-label','Process steps');});

// This form submits to the real enquiry API, with readable pending/error states.
$$('.s-enquiry-form').forEach(form=>{
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const submit=$('[type=submit]',form),status=$('[role=status]',form);
  const original=submit.innerHTML;
  submit.disabled=true;submit.textContent='Sending…';status.textContent='';status.classList.remove('is-error');
  try{
   const response=await fetch(form.action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form))),signal:AbortSignal.timeout(20000)});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||'Your brief could not be sent. Please try again.');
   form.reset();status.textContent='Your brief is with us. Thank you — we’ll be in touch.';
  }catch(error){status.classList.add('is-error');status.textContent=error.name==='TimeoutError'?'The connection took too long. Try again or email info@nexpixels.com.':error.message==='Failed to fetch'?'Please check your connection and try again, or email info@nexpixels.com.':error.message;}
  finally{submit.disabled=false;submit.innerHTML=original;}
 });
});


function updateMotion(){
 document.documentElement.classList.toggle('studio-motion-paused',isPaused());
 $$('.s-motion-toggle').forEach(button=>{button.setAttribute('aria-pressed',String(isPaused()));button.disabled=reduce.matches;button.textContent=reduce.matches?'Reduced motion':isPaused()?'Enable motion':'Pause motion';});
 if(isPaused())$('.s-preloader')?.setAttribute('hidden','');
 if(isPaused())document.getAnimations().forEach(animation=>{if(animation.effect?.target?.classList?.contains('nex-enter'))animation.cancel();});
 motionController?.update();
}
$$('.s-motion-toggle').forEach(button=>button.addEventListener('click',()=>{
 manuallyPaused=!isPaused();try{sessionStorage.setItem('studio-motion-paused',String(manuallyPaused));}catch{}updateMotion();
}));
reduce.addEventListener('change',updateMotion);updateMotion();

// Inner pages use lightweight entrances; their content is always visible without JS.
if(!home){
 const entrances=new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting)continue;entrances.unobserve(entry.target);if(!isPaused()){entry.target.classList.add('nex-enter');entry.target.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.2,.65,.3,1)'});}}
 },{rootMargin:'0px 0px -4% 0px'});
 $$('.page-hero .container,main .section>.container').forEach(element=>entrances.observe(element));
 addEventListener('pagehide',()=>entrances.disconnect(),{once:true});
}

// Heavy motion is progressive enhancement; links and forms are interactive immediately.
if(home){
 let requested=false;
 const enhance=()=>{
  import('./motion.js').then(({createMotion})=>{motionController=createMotion({isPaused,home});}).catch(error=>console.error('Reference motion unavailable:',error));

 };
 const requestEnhancements=()=>{
  if(requested||isPaused())return;requested=true;
  for(const type of ['pointermove','scroll','touchstart','keydown'])removeEventListener(type,requestEnhancements);
  requestAnimationFrame(()=>{if('requestIdleCallback'in window)requestIdleCallback(enhance,{timeout:800});else setTimeout(enhance,50);});
 };
 for(const type of ['pointermove','scroll','touchstart','keydown'])addEventListener(type,requestEnhancements,{passive:true});
}
addEventListener('pagehide',event=>{if(!event.persisted){motionController?.dispose();}});

if($('[data-pd-island]')){
 const islands=new IntersectionObserver(entries=>{
  if(!entries.some(entry=>entry.isIntersecting))return;islands.disconnect();
  import('./islands/client.tsx').then(({mountIslands})=>mountIslands()).catch(error=>console.error('PODIE enhancement unavailable:',error));
 },{rootMargin:'350px 0px'});
 $$('[data-pd-island]').forEach(element=>islands.observe(element));
}
