import type { GitSource, ResolvedSource } from './contracts.ts';
import { SourceError, commitSha, validPath, validateSource } from './source-validation.ts';
const encodePath=(path:string)=>path.split('/').map(encodeURIComponent).join('/');
export class GitSourceClient {
  private pending=new Map<string,Promise<any>>();
  private blockedUntil=0;
  private transport:typeof fetch;
  private files=new Map<string,Promise<string>>();
  constructor(transport:typeof fetch=(input,init)=>fetch(input,init)) {this.transport=transport;}
  private async get(url:string, missing:'REF_NOT_FOUND'|'FILE_NOT_FOUND') {
    if (Date.now()<this.blockedUntil) throw new SourceError('RATE_LIMIT','GitHub-Limit: Bitte bis zur angegebenen Zeit warten.',new Date(this.blockedUntil).toISOString());
    const existing=this.pending.get(url);if(existing)return existing;
    const request=(async()=>{
      let response:Response;
      try { response=await this.transport(url,{method:'GET',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10'},signal:AbortSignal.timeout(20000)}); }
      catch {throw new SourceError('NETWORK','Verbindung zu GitHub fehlgeschlagen oder Zeitlimit erreicht.');}
      if(!response.ok) {
        const retry=response.headers.get('retry-after'), reset=response.headers.get('x-ratelimit-reset');
        if(response.status===429 || response.status===403 && (retry!==null || response.headers.get('x-ratelimit-remaining')==='0')) {
          const times=[retry ? (/^\d+$/.test(retry)?Date.now()+Number(retry)*1000:Date.parse(retry)):NaN,reset?Number(reset)*1000:NaN].filter(Number.isFinite);
          this.blockedUntil=times.length?Math.max(...times):0;
          throw new SourceError('RATE_LIMIT','GitHub-Limit erreicht. Bitte später erneut laden.',this.blockedUntil?new Date(this.blockedUntil).toISOString():undefined);
        }
        if(response.status===404)throw new SourceError(missing,'Ref oder Datei nicht gefunden. Pfad, Ref und öffentliche Sichtbarkeit prüfen.');
        if([401,403].includes(response.status))throw new SourceError('ACCESS_DENIED','Quelle nicht öffentlich lesbar oder Zugriff beschränkt.');
        throw new SourceError(response.status>=500?'NETWORK':'INVALID_DATA',`Unerwartete GitHub-Antwort (${response.status}).`);
      }
      try{return await response.json();}catch{throw new SourceError('INVALID_DATA','GitHub liefert kein gültiges JSON.');}
    })();
    this.pending.set(url,request);
    try{return await request;}finally{this.pending.delete(url);}
  }
  private base(source:GitSource) {return `https://api.github.com/repos/${encodeURIComponent(source.repository.owner)}/${encodeURIComponent(source.repository.name)}`;}
  async resolve(input:GitSource):Promise<ResolvedSource> {
    const source=validateSource(input),base=this.base(source),ref=source.ref;
    if(ref.kind==='commit') {
      const data=await this.get(`${base}/commits/${ref.value}`,'REF_NOT_FOUND');
      if(data?.sha!==ref.value)throw new SourceError('INVALID_DATA','Commit-Antwort stimmt nicht mit der Quelle überein.');
      return {source,commit:ref.value};
    }
    const expected=`refs/${ref.kind==='branch'?'heads':'tags'}/${ref.value}`;
    const data=await this.get(`${base}/git/ref/${expected.slice(5).split('/').map(encodeURIComponent).join('/')}`,'REF_NOT_FOUND');
    if(data?.ref!==expected)throw new SourceError('INVALID_DATA','Keine exakte Ref-Antwort.');
    let target=data.object;const seen=new Set();
    for(let step=0;step<=10;step++) {
      if(!target || !commitSha(target.sha))break;
      if(target.type==='commit')return {source,commit:target.sha};
      if(target.type!=='tag' || step===10 || seen.has(target.sha))break;
      seen.add(target.sha);target=(await this.get(`${base}/git/tags/${target.sha}`,'REF_NOT_FOUND'))?.object;
    }
    throw new SourceError('INVALID_DATA','Tag-Ziel ist kein Commit, zyklisch oder zu tief verschachtelt.');
  }
  async text(resolved:ResolvedSource,path=resolved.source.path):Promise<string> {
    const key=JSON.stringify([resolved.source.repository.owner.toLowerCase(),resolved.source.repository.name.toLowerCase(),resolved.commit,path]);
    const previous=this.files.get(key);if(previous)return previous;
    const request=this.readText(resolved,path);this.files.set(key,request);
    try{return await request;}catch(e){this.files.delete(key);throw e;}
  }
  private async readText(resolved:ResolvedSource,path:string):Promise<string> {
    validateSource(resolved.source);
    if(!commitSha(resolved.commit) || !(validPath(path,'.md') || validPath(path,'.json')))throw new SourceError('INVALID_CONFIG','Ungültiger Commit oder Dateipfad.');
    const d=await this.get(`${this.base(resolved.source)}/contents/${encodePath(path)}?ref=${resolved.commit}`,'FILE_NOT_FOUND');
    if(!d || d.type!=='file' || d.encoding!=='base64' || typeof d.content!=='string' || !Number.isSafeInteger(d.size) || d.size<=0 || d.size>1048576 || d.content.length>1500000)throw new SourceError('INVALID_DATA','Datei muss Base64-Inhalt mit maximal 1 MB enthalten.');
    try {
      const raw=atob(d.content.replace(/\s/g,''));
      if(raw.length!==d.size || raw.length>1048576)throw Error();
      const value=new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,c=>c.charCodeAt(0)));
      if(!value.trim())throw Error();return value;
    }catch {throw new SourceError('INVALID_DATA','Datei ist leer oder enthält ungültiges Base64/UTF-8.');}
  }
  async json(resolved:ResolvedSource):Promise<unknown> {
    const value=await this.text(resolved);
    try{return JSON.parse(value);}catch{throw new SourceError('INVALID_DATA','Quelldatei enthält ungültiges JSON.');}
  }
}
