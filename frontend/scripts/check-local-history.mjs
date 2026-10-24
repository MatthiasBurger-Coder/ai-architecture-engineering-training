import { trainings } from '../src/app/catalog.ts';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { legacyValid, legacyCorrupt, dataset } from '../src/app/contracts.fixtures.ts';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {expect}=await import(process.env.PLAYWRIGHT_TEST_MODULE || '@playwright/test');
const profile=await mkdtemp(join(tmpdir(),'learning-history-'));
const options={headless:true,viewport:{width:1440,height:1100},...(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{})};
const base=process.env.LEARNING_STUDIO_URL || 'http://127.0.0.1:4200';
const quiz=JSON.parse(await readFile(new URL('../../modules/M01-llm-foundations/assessment/quiz.json',import.meta.url),'utf8'));
const m09Quiz=JSON.parse(await readFile(new URL('../../modules/M09-model-training-finetuning/assessment/quiz.json',import.meta.url),'utf8'));
const calls=[],errors=[];
let context;
async function launch(){
 context=await chromium.launchPersistentContext(profile,options);
 await context.route('https://api.github.com/**',async route=>{
  const r=route.request(),u=new URL(r.url());calls.push(u.href);assert.equal(r.method(),'GET');assert.equal(r.postData(),null);
  if(u.pathname.includes('/git/ref/'))return route.fulfill({json:{ref:'refs/heads/main',object:{type:'commit',sha:'a'.repeat(40)}}});
  const id=u.pathname.match(/modules\/(M\d\d)/)?.[1] || 'M01';
  let content;
  if(u.pathname.endsWith('quiz.json'))content=JSON.stringify({...id==='M09'?m09Quiz:quiz,trainingId:id});
  else if(u.pathname.endsWith('materials.json'))content=JSON.stringify({schemaVersion:id==='M09'?2:1,trainingId:id,materials:[{id:'overview',title:'Überblick',kind:'overview',path:`modules/${id}/README.md`}]});
  else content='# Gespeicherter Lesefortschritt\n\nLokaler Testinhalt.';
  return route.fulfill({json:{type:'file',encoding:'base64',size:Buffer.byteLength(content),content:Buffer.from(content).toString('base64')}});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await expect(page.locator('.training-card')).toHaveCount(trainings.length);return page;
}
const nav=(page,name)=>page.getByRole('button',{name}).click();
async function answer(page,pass=true,data=quiz){for(let i=0;i<data.questions.length;i++){const q=data.questions[i],correct=q.options.findIndex(o=>o.id===q.correctOptionId);await page.locator('.quiz-question').nth(i).getByRole('radio').nth(pass?correct:(correct+1)%q.options.length).check();}}
async function rawAttempts(page){return page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('ai-training-local',1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('attempts'),q=tx.objectStore('attempts').getAll();tx.oncomplete=()=>{db.close();resolve(q.result);};};}));}
try{
 let page=await launch();await page.evaluate(raw=>localStorage.setItem('ai-training-demo-v1',raw),legacyValid);await page.reload();
 await nav(page,'Training Administration');await expect(page.locator('.local-settings')).toContainText('Demo-Altdaten erhalten');await expect(page.locator('.stats')).toContainText('0 / 10');
 await nav(page,'Learning Workspace');await page.locator('.lesson-list button').first().click();await page.getByRole('button',{name:'Als gelesen markieren',exact:true}).click();await expect(page.getByRole('button',{name:'✓ Als gelesen vermerkt',exact:true})).toBeVisible();
 await nav(page,'Assessment Center');await page.selectOption('#module','M09');await expect(page.getByRole('heading',{name:'Ein Schritt nach dem anderen.'})).toBeVisible();await expect(page.getByRole('button',{name:'Wissenstest starten →',exact:true})).toHaveCount(0);await page.selectOption('#module','M01');await page.getByRole('button',{name:'Wissenstest starten →',exact:true}).click();await answer(page);
 // Abort after the individual add succeeds: only transaction completion may unlock.
 await page.evaluate(()=>{window.originalAdd=IDBObjectStore.prototype.add;IDBObjectStore.prototype.add=function(...args){const r=window.originalAdd.apply(this,args);if(this.name==='attempts'){window.failedAttemptId=args[0].id;r.addEventListener('success',()=>this.transaction.abort());}return r;};});
 await page.getByRole('button',{name:'Wissenstest auswerten →',exact:true}).click();await expect(page.getByRole('button',{name:'Erneut speichern ↻',exact:true})).toBeEnabled();await expect(page.locator('.quiz-result')).toContainText('4 von 4 richtig');assert.equal((await rawAttempts(page)).length,0);
 await expect(page.locator('.stats')).toContainText('0 / 10');
 await page.evaluate(()=>{IDBObjectStore.prototype.add=window.originalAdd;});await page.getByRole('button',{name:'Erneut speichern ↻',exact:true}).click();await expect(page.locator('.attempt-history details')).toHaveCount(1);await expect(page.locator('.stats')).toContainText('1 / 10');
 await page.screenshot({path:join(tmpdir(),'issue10-assessment-desktop.png'),fullPage:true});
 const saved=(await rawAttempts(page))[0];assert.equal(saved.id,await page.evaluate(()=>window.failedAttemptId));assert.equal(saved.score.passed,true);assert.equal(saved.questions.provenance.commit,'a'.repeat(40));
 // Optional M09 branch uses v2 sources and persisted M01, without blocking M02.
 await page.selectOption('#module','M09');await page.getByRole('button',{name:'Wissenstest starten →',exact:true}).click();await answer(page,true,m09Quiz);await page.getByRole('button',{name:'Wissenstest auswerten →',exact:true}).click();await expect(page.locator('.stats')).toContainText('2 / 10');
 await page.screenshot({path:join(tmpdir(),'pr15-m09-assessment-desktop.png'),fullPage:true});
 const optional=(await rawAttempts(page)).find(a=>a.trainingId==='M09');assert.equal(optional.schemaVersion,2);assert.deepEqual(optional.prerequisites,[{trainingId:'M01',attemptId:saved.id}]);
 await page.selectOption('#module','M01');
 // Failed repetition appends, preserving the passing result.
 await page.getByRole('button',{name:'Wissenstest wiederholen ↺',exact:true}).click();await page.getByRole('button',{name:'Wissenstest starten →',exact:true}).click();await answer(page,false);await page.getByRole('button',{name:'Wissenstest auswerten →',exact:true}).click();await expect(page.locator('.attempt-history details')).toHaveCount(2);await expect(page.locator('.stats')).toContainText('2 / 10');
 const ids=(await rawAttempts(page)).map(a=>a.id);assert.equal(new Set(ids).size,3);
 await page.reload();await nav(page,'Assessment Center');await expect(page.locator('.attempt-history details')).toHaveCount(2);
 await page.selectOption('#module','M02');await expect(page.getByRole('button',{name:'Wissenstest starten →',exact:true})).toBeEnabled();
 // A second tab starts against the persisted chain and captures precise predecessor IDs.
 const second=await context.newPage();await second.goto(base);await nav(second,'Assessment Center');await second.selectOption('#module','M02');await second.getByRole('button',{name:'Wissenstest starten →',exact:true}).click();await answer(second);await second.getByRole('button',{name:'Wissenstest auswerten →',exact:true}).click();await expect(second.locator('.stats')).toContainText('3 / 10');
 const m02=(await rawAttempts(second)).find(a=>a.trainingId==='M02');assert.deepEqual(m02.prerequisites,[{trainingId:'M01',attemptId:saved.id}]);await second.close();
 // Export is local and import rejects a conflict without partial writes.
 await nav(page,'Training Administration');const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Sicherung exportieren',exact:true}).click()]);assert.equal(download.suggestedFilename(),'learning-studio-v2.json');const exported=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(exported.attempts.length,4);assert.equal(exported.read.length,1);
 await page.locator('#local-import').fill(JSON.stringify({...dataset,schemaVersion:99}));await page.getByRole('button',{name:'Sicherung lokal importieren',exact:true}).click();await expect(page.locator('.local-settings')).toContainText('Import abgelehnt');assert.equal((await rawAttempts(page)).length,4);
 await page.locator('#local-import').fill(JSON.stringify(exported));await page.getByRole('button',{name:'Sicherung lokal importieren',exact:true}).click();await expect(page.locator('.local-settings')).toContainText('Sicherung lokal zusammengeführt');assert.equal((await rawAttempts(page)).length,4);
 await page.evaluate(raw=>localStorage.setItem('ai-training-demo-v1',raw),legacyCorrupt);await page.reload();await expect(page.getByRole('alert')).toContainText('Konflikt');assert.equal(await page.evaluate(()=>localStorage.getItem('ai-training-demo-v1')),legacyCorrupt);
 await nav(page,'Training Administration');const [recoveryDownload]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Rohdaten exportieren',exact:true}).click()]);const recovery=JSON.parse(await readFile(await recoveryDownload.path(),'utf8'));assert.equal(recovery.legacy,legacyCorrupt);assert.equal(recovery.database.entries.find(x=>x.name==='legacy').values[0].raw,legacyValid);
 await context.close();page=await launch();await expect(page.locator('.stats')).toContainText('3 / 10');await nav(page,'Assessment Center');await expect(page.locator('.attempt-history details')).toHaveCount(2);
 await nav(page,'Learning Workspace');await page.locator('.lesson-list button').first().click();await expect(page.getByRole('button',{name:'✓ Als gelesen vermerkt',exact:true})).toBeVisible();
 // Corrupt predecessor remains raw; dependent result stops qualifying.
 await page.evaluate(id=>new Promise(resolve=>{const r=indexedDB.open('ai-training-local',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('attempts','readwrite'),s=tx.objectStore('attempts'),q=s.get(id);q.onsuccess=()=>s.put({...q.result,score:{...q.result.score,earned:0}});tx.oncomplete=()=>{db.close();resolve();};};}),saved.id);
 await page.reload();await expect(page.locator('.stats')).toContainText('0 / 10');await expect(page.getByRole('alert')).toContainText('Punktestand');assert.equal((await rawAttempts(page)).length,4);
 await page.setViewportSize({width:390,height:844});for(const view of ['Training Administration','Assessment Center','Skill Tree']){await nav(page,view);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow: ${view}`);await page.screenshot({path:join(tmpdir(),`issue10-${view.replaceAll(' ','-')}-mobile.png`),fullPage:true});}
 assert.deepEqual(errors,[]);assert.ok(calls.every(url=>!ids.some(id=>url.includes(id))));
 console.log(`Local history browser checks passed: optional M09 v2 branch, migration/conflict, transaction abort/retry, append-only retries, reload, full browser restart with same profile, read markers, predecessor references in second tab, local export, rejected import, corrupt chain retention; 1440/390px; ${calls.length} GET-only source requests.`);
}finally{await context?.close();await rm(profile,{recursive:true,force:true});}
