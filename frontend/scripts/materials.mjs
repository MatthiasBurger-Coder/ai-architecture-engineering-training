import { readdir, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
const root = resolve(import.meta.dirname, '../..');
const dest = resolve(root, 'frontend/public/materials');
await rm(dest, {recursive:true, force:true});
await mkdir(dest, {recursive:true});
const index = {};
async function walk(dir) {
  const result=[];
  for (const e of await readdir(dir,{withFileTypes:true})) {
    const path=resolve(dir,e.name);
    if(e.isDirectory()) result.push(...await walk(path));
    else if(e.name.endsWith('.md') || e.name==='quiz.json') result.push(path);
  }
  return result.sort();
}
for(const entry of (await readdir(resolve(root,'modules'))).sort()) {
  const id=entry.slice(0,3);
  index[id]=[];
  for(const path of await walk(resolve(root,'modules',entry))) {
    const rel=relative(root,path).replaceAll('\\','/');
    const text=await readFile(path,'utf8');
    const target=resolve(dest,rel);
    await mkdir(resolve(target,'..'),{recursive:true});
    await writeFile(target,text);
    if(rel.endsWith(`${entry}/README.md`) || /\/(lessons|exercises)\//.test(rel)) {
      index[id].push({path:rel,title:text.match(/^#\s+(.+)/m)?.[1] || rel,kind:rel.includes('/lessons/')?'Lektion':rel.includes('/exercises/')?'Aufgabe':'Überblick'});
    }
  }
}
index.CAP=[{path:'ROADMAP.md',title:'Capstone · Zielarchitektur und Abnahmekriterien',kind:'Überblick'}];
await writeFile(resolve(dest,'ROADMAP.md'),await readFile(resolve(root,'ROADMAP.md'),'utf8'));
await mkdir(resolve(dest,'capstone/assessment'),{recursive:true});
await writeFile(resolve(dest,'capstone/assessment/quiz.json'),await readFile(resolve(root,'capstone/assessment/quiz.json'),'utf8'));
await writeFile(resolve(dest,'index.json'),JSON.stringify(index,null,2));
console.log('Repository-Lernmaterialien synchronisiert.');
