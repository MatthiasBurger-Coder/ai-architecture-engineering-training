import { Marked, Renderer } from 'marked';
import { validPath } from './source-validation.ts';
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export function relativeMaterial(href:string,path:string):string|null {
  if(/^[a-z][a-z0-9+.-]*:|^\/|^#|[\\%?]/i.test(href))return null;
  const value=new URL(href,`https://material.invalid/${path}`);
  return value.origin==='https://material.invalid' && validPath(value.pathname.slice(1),'.md')?value.pathname.slice(1):null;
}
export async function renderMaterial(markdown:string,path:string) {
  const renderer=new Renderer();
  renderer.html=({text})=>escape(text);
  renderer.image=({text})=>`<span>[Bild: ${escape(text)} · nicht automatisch geladen]</span>`;
  renderer.link=function({href,tokens}) {
    const label=this.parser.parseInline(tokens);
    if(/^https:\/\//i.test(href)) {
      try { const url=new URL(href);if(!url.username&&!url.password)return `<a href="${escape(url.href)}" target="_blank" rel="noopener noreferrer">${label}</a>`; }catch{}
    }
    const relative=relativeMaterial(href,path);
    if(relative)return `<a href="#material/${escape(relative)}">${label}</a>`;
    return `<span>${label} (Download oder Link nicht unterstützt)</span>`;
  };
  return new Marked({renderer}).parse(markdown);
}
