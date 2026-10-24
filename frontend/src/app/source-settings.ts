import type { SourceConfiguration } from './contracts.ts';
import { validateConfiguration } from './source-validation.ts';
/** Uses the v1 settings store; attempts/history are implemented separately in #10. */
async function database():Promise<IDBDatabase> {
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('ai-training-local',1);
    request.onupgradeneeded=()=>{
      const db=request.result;
      db.createObjectStore('settings');db.createObjectStore('meta');db.createObjectStore('read');db.createObjectStore('legacy');
      db.createObjectStore('attempts',{keyPath:'id'}).createIndex('trainingId','trainingId');
      request.transaction!.objectStore('meta').put(1,'schemaVersion');
    };
    request.onerror=()=>reject(request.error);
    request.onblocked=()=>reject(Error('Speicher blockiert. Bitte andere Learning-Studio-Tabs schließen.'));
    request.onsuccess=()=>resolve(request.result);
  });
}
export async function settings(value?:SourceConfiguration):Promise<SourceConfiguration|undefined> {
  const db=await database();
  try{return await new Promise((resolve,reject)=>{
    const tx=db.transaction('settings',value?'readwrite':'readonly'),store=tx.objectStore('settings');
    const request=value?store.put(validateConfiguration(value),'sources'):store.get('sources');
    tx.oncomplete=()=>{try{resolve(value || (request.result===undefined?undefined:validateConfiguration(request.result)));}catch(e){reject(e);}};
    tx.onabort=()=>reject(tx.error || Error('Speichertransaktion abgebrochen.'));
    tx.onerror=()=>reject(tx.error);
  });}finally{db.close();}
}
