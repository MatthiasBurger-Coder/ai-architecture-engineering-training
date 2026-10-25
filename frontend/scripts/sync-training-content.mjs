import {cp, mkdir, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const frontend=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const repository=resolve(frontend,'..');
const destination=resolve(frontend,'public/training-content');
await rm(destination,{recursive:true,force:true});
await mkdir(destination,{recursive:true});
for(const name of ['modules','capstone']) await cp(resolve(repository,name),resolve(destination,name),{recursive:true});
await cp(resolve(repository,'ROADMAP.md'),resolve(destination,'ROADMAP.md'));
