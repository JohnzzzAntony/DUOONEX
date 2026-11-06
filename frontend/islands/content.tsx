import { Braces, PanelsTopLeft, Workflow } from 'lucide-react';
import type { Step } from '../../components/podie/chamaac--how-it-works/author/1/how-it-works';
import type { ProcessStep } from '../../components/podie/tween-ui--process-card-reveal/author/1/process-card-reveal';

export const capabilities = [
 {name:'UI/UX design',description:'Clear user journeys, responsive Figma interfaces and reusable design systems.',href:'/services/ui-ux-design/',icon:<PanelsTopLeft aria-hidden="true" />},
 {name:'Custom web development',description:'Responsive websites, editable content and integrations built around your business.',href:'/services/custom-web-development/',icon:<Braces aria-hidden="true" />},
 {name:'Business applications',description:'Shared workflows, role-based access and connected operational tools.',href:'/services/web-app-mvp-development/',icon:<Workflow aria-hidden="true" />}
];
const colors={bg:'bg-[var(--pd-note)]',text:'text-[var(--pd-forest)]',border:'border-[var(--pd-line)]'};
export const stages:Step[]=[
 {title:'Discover',description:'Listen. Ask. Find the real problem. Agree the users, requirements and scope before design begins.',colors},
 {title:'Design',description:'Turn the direction into something tangible. Review journeys, responsive interfaces and important interaction states.',colors},
 {title:'Develop',description:'Build the details that make it work. Connect approved designs, content controls and the agreed business systems.',colors},
 {title:'Deliver',description:'Test, launch, and hand over with care. Document the delivered scope, editing controls and support responsibilities.',colors}
];
export const projects:ProcessStep[]=[
 {id:'finora',title:'Finora',description:'Connected accounting. A clearer picture.',image:'/assets/images/projects/finora-mockup-1.webp',imageAlt:'Finora accounting dashboard across desktop, tablet, and mobile',href:'/case-studies/finora/',details:[{title:'The product',description:'Sales, purchases, inventory, banking and ledger-based business reports.'},{title:'The work',description:'Product design · development'}]},
 {id:'mechaura',title:'Mechaura',description:'Industrial expertise, made accessible.',image:'/assets/images/projects/mechaura-mockup-1.webp',imageAlt:'Mechaura industrial product website on responsive device mockups',href:'/case-studies/mechaura/',details:[{title:'The website',description:'Product specifications, sector information and quotation enquiries for UAE buyers.'},{title:'The work',description:'Web design · development'}]},
 {id:'nexora',title:'Nexora',description:'A shared workspace. Everything connected.',image:'/assets/images/projects/nexora-mockup-1.webp',imageAlt:'Nexora help desk workspace dashboard on desktop and mobile',href:'/case-studies/nexora/',details:[{title:'The platform',description:'Support tickets, tasks, approvals and customer service with organisation-scoped access.'},{title:'The work',description:'Experience design · development'}]}
];
const art='/assets/images/studio/';
export const delivery:ProcessStep[]=[
 {id:'discover',title:'Discover the right scope',description:stages[0].description,image:art+'custom-web-development-800.webp',imageAlt:'Glass browser panels illustrating a custom web project',details:[{title:'Start with the task',description:'Identify the users, content and business requirements.'},{title:'Agree the brief',description:'Make scope, dependencies and review points clear.'}]},
 {id:'design',title:'Design the experience',description:stages[1].description,image:art+'interface-design-800.webp',imageAlt:'Frosted glass panels illustrating responsive interface design',details:[{title:'Map the journey',description:'Review the steps and information users need.'},{title:'Resolve the states',description:'Include loading, empty results, errors and feedback.'}]},
 {id:'develop',title:'Build the working product',description:stages[2].description,image:art+'connected-applications-800.webp',imageAlt:'Connected graphite modules illustrating business integrations',details:[{title:'Connect the systems',description:'Build the agreed content controls, APIs and workflows.'},{title:'Review in context',description:'Test with realistic content and user tasks.'}]},
 {id:'deliver',title:'Launch with a clear handover',description:stages[3].description,image:art+'custom-web-development-800.webp',imageAlt:'Custom web development concept with glass interfaces and green ribbon',details:[{title:'Check the release',description:'Review responsive layouts and agreed acceptance criteria.'},{title:'Plan ownership',description:'Document editing, deployment and maintenance responsibilities.'}]}
];
