import { hydrateRoot } from 'react-dom/client';
import { Island, type IslandName } from './Island';
export function mountIslands(){
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);
   const element=entry.target as HTMLElement;
   hydrateRoot(element,<Island name={element.dataset.pdIsland as IslandName}/>,{identifierPrefix:element.id+'-',onRecoverableError:error=>console.error('PODIE hydration error:',error)});
   element.dataset.pdMounted='true';
  }
 },{rootMargin:'250px 0px'});
 document.querySelectorAll<HTMLElement>('[data-pd-island]').forEach(element=>observer.observe(element));
}
