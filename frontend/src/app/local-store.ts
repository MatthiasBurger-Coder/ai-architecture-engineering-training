import type { CompletedAttempt, LocalDataset, ReadMarker, SourceConfiguration } from './contracts.ts';
import { defaultSources } from './default-sources.ts';
import { validateConfiguration } from './source-validation.ts';
import { ensure, qualify, validateAttempt, validateDataset, validateRead, readIdentity, validateLegacy, legacyKey, legacyStatus, same } from './local-data.ts';
const stores=['meta','settings','attempts','read','legacy'] as const;
type StoreName=typeof stores[number];
export async function database(raw=false):Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    const request=raw?indexedDB.open('ai-training-local'):indexedDB.open('ai-training-local',1);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(raw){request.transaction!.abort();return;}
      for(const name of ['settings','meta','read','legacy'])db.createObjectStore(name);
      db.createObjectStore('attempts',{keyPath:'id'}).createIndex('trainingId','trainingId');
      request.transaction!.objectStore('meta').put(1,'schemaVersion');
    };
    let blocked=false;
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>{blocked=true;reject(Error('Speicher blockiert. Bitte andere Learning-Studio-Tabs schließen und erneut laden.'));};
    request.onsuccess=()=>{const db=request.result;if(blocked){db.close();return;}db.onversionchange=()=>db.close();resolve(db);};
  });
}
const get=<T=any>(r:IDBRequest<T>):Promise<T>=>new Promise((resolve,reject)=>{r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
export async function transaction<T>(names:StoreName[],mode:IDBTransactionMode,work:(tx:IDBTransaction)=>Promise<T>):Promise<T>{
  const db=await database();
  try{return await new Promise<T>((resolve,reject)=>{
    let value:T,failure:unknown;
    let tx:IDBTransaction;
    try{tx=db.transaction([...new Set<StoreName>(['meta',...names])],mode);}catch(e){reject(e);return;}
    tx.oncomplete=()=>resolve(value);
    tx.onabort=()=>reject(failure || tx.error || Error('Speichertransaktion abgebrochen.'));
    tx.onerror=()=>{failure ||= tx.error;};
    void (async()=>{ensure(await get(tx.objectStore('meta').get('schemaVersion'))===1,'nicht unterstützte Speicherversion');value=await work(tx);})().catch(e=>{failure=e;try{tx.abort();}catch{reject(e);}});
  });}finally{db.close();}
}
export async function settings(value?:SourceConfiguration):Promise<SourceConfiguration|undefined>{
  return transaction(['settings'],'readwrite',async tx=>{
    const store=tx.objectStore('settings'),old=await get(store.get('sources'));
    if(old!==undefined)validateConfiguration(old); // Never silently replace an unreadable configuration.
    if(value){const next=validateConfiguration(value);store.put(next,'sources');return next;}
    return old===undefined?undefined:validateConfiguration(old);
  });
}
export async function migrate(raw:string|null){
  if(raw===null)return;
  await transaction(['legacy'],'readwrite',async tx=>{
    const store=tx.objectStore('legacy'),old=await get(store.get(legacyKey));
    if(old!==undefined){validateLegacy(old);ensure(old.raw===raw,'Demo-Altdaten-Konflikt: Archiv und LocalStorage unterscheiden sich; beide bleiben erhalten.');return;}
    store.add({id:legacyKey,raw,importedAt:new Date().toISOString(),status:legacyStatus(raw)},legacyKey);
  });
}
export interface LocalState { dataset:LocalDataset; problems:string[]; recovery:unknown }
export async function restoreLocal():Promise<LocalState>{
  return transaction([...stores],'readonly',async tx=>{
    const entries=await Promise.all(stores.map(async name=>({name,keys:await get(tx.objectStore(name).getAllKeys()),values:await get(tx.objectStore(name).getAll())})));
    const rows=(name:StoreName)=>entries.find(x=>x.name===name)!;
    const problems:string[]=[],rawAttempts=rows('attempts').values;
    const checked=qualify(rawAttempts);problems.push(...checked.invalid.map(x=>x.message));
    const read:ReadMarker[]=[],legacy:LocalDataset['legacy']=[];
    for(const name of ['read','legacy'] as const)rows(name).values.forEach((v,i)=>{try{
      if(name==='read'){const marker=validateRead(v);ensure(rows(name).keys[i]===readIdentity(marker),'Leseschlüssel');read.push(marker);}
      else {const archive=validateLegacy(v);ensure(rows(name).keys[i]===legacyKey,'Archivschlüssel');legacy.push(archive);}
    }catch(e){problems.push(String(e));}});
    let configuration:SourceConfiguration={schemaVersion:1,trainings:[]};
    try{configuration=validateConfiguration(await get(tx.objectStore('settings').get('sources')) || defaultSources);}catch(e){problems.push('Quellenkonfiguration nicht auswertbar: '+String(e));}
    return {dataset:{schemaVersion:1,configuration,attempts:checked.valid,read,legacy},problems,recovery:{database:'ai-training-local',entries}};
  });
}
export async function saveAttempt(value:CompletedAttempt){
  const attempt=validateAttempt(value);
  await transaction(['attempts'],'readwrite',async tx=>{
    const store=tx.objectStore('attempts'),rows=await get(store.getAll()),old=rows.find(x=>x.id===attempt.id);
    ensure(old===undefined || same(old,attempt),'Konflikt unter bestehender Versuch-ID');
    const checked=qualify(old===undefined?[...rows,attempt]:rows);
    ensure(checked.valid.some(x=>x.id===attempt.id),'Versuch hat keine gültige gespeicherte Voraussetzungskette');
    if(old===undefined)store.add(attempt);
  });
}
export async function saveRead(value:ReadMarker){const v=validateRead(value);await transaction(['read'],'readwrite',async tx=>{
  const store=tx.objectStore('read'),key=readIdentity(v),old=await get(store.get(key));if(old!==undefined)validateRead(old);store.put(v,key);
});}
export async function importLocal(input:unknown){
  const dataset=validateDataset(input);
  await transaction(['attempts','read','legacy','settings'],'readwrite',async tx=>{
    const existing=await get(tx.objectStore('attempts').getAll());
    for(const a of dataset.attempts){const old=existing.find(x=>x.id===a.id);ensure(old===undefined || same(old,a),'Importkonflikt Versuch-ID');if(old===undefined)existing.push(a);}
    const combined=qualify(existing);for(const a of dataset.attempts)ensure(combined.valid.some(x=>x.id===a.id),'Importkette');
    for(const a of dataset.attempts)if(!await get(tx.objectStore('attempts').get(a.id)))tx.objectStore('attempts').add(a);
    for(const r of dataset.read){const key=readIdentity(r),old=await get(tx.objectStore('read').get(key));ensure(old===undefined || same(old,r),'Importkonflikt Lesemarkierung');if(old===undefined)tx.objectStore('read').add(r,key);}
    for(const l of dataset.legacy){const old=await get(tx.objectStore('legacy').get(l.id));ensure(old===undefined || same(old,l),'Importkonflikt Archiv');if(old===undefined)tx.objectStore('legacy').add(l,l.id);}
    const configuration=await get(tx.objectStore('settings').get('sources'));
    if(configuration!==undefined)validateConfiguration(configuration);
    else tx.objectStore('settings').put(defaultSources,'sources');
  });
  return dataset.configuration; // Offered separately; never silently activate backup sources.
}
/** Raw export also works when metadata or records cannot be validated. */
export async function recoveryExport(){
  const db=await database(true);
  try{return await new Promise((resolve,reject)=>{
    const tx=db.transaction([...db.objectStoreNames],'readonly');const entries:any[]=[];
    for(const name of db.objectStoreNames){const row:any={name};entries.push(row);const s=tx.objectStore(name);s.getAllKeys().onsuccess=e=>row.keys=(e.target as IDBRequest).result;s.getAll().onsuccess=e=>row.values=(e.target as IDBRequest).result;}
    tx.oncomplete=()=>resolve({database:db.name,version:db.version,entries});tx.onabort=()=>reject(tx.error);
  });}finally{db.close();}
}
