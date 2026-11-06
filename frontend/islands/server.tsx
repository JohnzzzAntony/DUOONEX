import { renderToString } from 'react-dom/server';
import { Island, type IslandName } from './Island';
export function renderIsland(name:IslandName,id:string){return renderToString(<Island name={name}/>,{identifierPrefix:id+'-'});}
