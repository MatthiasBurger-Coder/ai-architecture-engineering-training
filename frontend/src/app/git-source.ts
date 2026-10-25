import type { GitSource, ResolvedSource } from './contracts.ts';
import { SourceError, commitSha, validPath, validateSource } from './source-validation.ts';
const encodePath=(path:string)=>path.split('/').map(encodeURIComponent).join('/');
const LOCAL_CHECKOUT='0000000000000000000000000000000000000000';

/** Reads only files shipped from the current checkout by Angular's asset pipeline. */
export class GitSourceClient {
  private transport:typeof fetch;
  private files=new Map<string,Promise<string>>();
  constructor(transport:typeof fetch=(input,init)=>fetch(input,init)) {this.transport=transport;}
  async resolve(input:GitSource):Promise<ResolvedSource> {
    const source=validateSource(input);
    return {source,commit:LOCAL_CHECKOUT};
  }
  async text(resolved:ResolvedSource,path=resolved.source.path):Promise<string> {
    const key=JSON.stringify([resolved.source.repository.owner.toLowerCase(),resolved.source.repository.name.toLowerCase(),resolved.commit,path]);
    const previous=this.files.get(key);if(previous)return previous;
    const request=this.readText(resolved,path);this.files.set(key,request);
    try{return await request;}finally{this.files.delete(key);}
  }
  private async readText(resolved:ResolvedSource,path:string):Promise<string> {
    validateSource(resolved.source);
    if(!commitSha(resolved.commit) || !(validPath(path,'.md') || validPath(path,'.json')))throw new SourceError('INVALID_CONFIG','Ungültiger Commit oder Dateipfad.');
    const base=typeof document==='undefined'?'http://localhost/':document.baseURI;
    const url=new URL(`training-content/${encodePath(path)}`,base).toString();
    let response:Response;
    try{response=await this.transport(url,{method:'GET',cache:'no-cache',credentials:'same-origin',redirect:'error',signal:AbortSignal.timeout(20000)});}
    catch{throw new SourceError('NETWORK','Lokale Checkout-Datei konnte nicht geladen werden.');}
    if(!response.ok)throw new SourceError(response.status===404?'FILE_NOT_FOUND':response.status>=500?'NETWORK':'INVALID_DATA',`Lokale Datei nicht verfügbar (${response.status}): ${path}`);
    const declared=Number(response.headers.get('content-length'));
    if(Number.isFinite(declared)&&declared>1048576)throw new SourceError('INVALID_DATA','Datei überschreitet die maximale Größe von 1 MB.');
    const value=await response.text();
    if(!value.trim()||new TextEncoder().encode(value).length>1048576)throw new SourceError('INVALID_DATA','Datei ist leer oder überschreitet die maximale Größe von 1 MB.');
    return value;
  }
  async json(resolved:ResolvedSource):Promise<unknown> {
    const value=await this.text(resolved);
    try{return JSON.parse(value);}catch{throw new SourceError('INVALID_DATA','Quelldatei enthält ungültiges JSON.');}
  }
}
