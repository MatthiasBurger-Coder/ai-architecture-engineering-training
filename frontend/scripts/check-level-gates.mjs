import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { questionSet } from '../src/app/contracts.fixtures.ts';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {expect}=await import(process.env.PLAYWRIGHT_TEST_MODULE || '@playwright/test');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{})});
const base=process.env.LEARNING_STUDIO_URL || 'http://127.0.0.1:4200';
const questions=questionSet.questions.slice(0,3),errors=[];
let sourceMode='ready';
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}});page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://api.github.com/**',async route=>{
  const r=route.request(),u=new URL(r.url());assert.equal(r.method(),'GET');assert.equal(r.postData(),null);
  if(u.pathname.includes('/git/ref/'))return route.fulfill({json:{ref:'refs/heads/main',object:{type:'commit',sha:({ready:'a',invalid:'b',missing:'c'})[sourceMode].repeat(40)}}});
  if(sourceMode==='missing')return route.fulfill({status:404,json:{message:'Not Found'}});
  const trainingId=u.pathname.match(/modules\/(M\d\d)/)?.[1] || 'M01';
  let value;
  if(u.pathname.endsWith('quiz.json'))value={...questionSet,trainingId,questions:sourceMode==='invalid'?[]:questions};
  else if(u.pathname.endsWith('materials.json'))value={schemaVersion:1,trainingId,materials:[{id:'overview',title:'Überblick',kind:'overview',path:`modules/${trainingId}/README.md`}]};
  else value='# Lokaler Lerntext';
  const raw=typeof value==='string'?value:JSON.stringify(value);return route.fulfill({json:{type:'file',encoding:'base64',size:Buffer.byteLength(raw),content:Buffer.from(raw).toString('base64')}});
 });
 await page.goto(base);await expect(page.locator('.training-card')).toHaveCount(10);
 // Exercise the actual action handlers, including calls bypassing disabled UI controls.
 await page.evaluate(()=>{window.app=window.ng?.getComponent(document.querySelector('app-root'));if(!window.app)throw Error('Dieser Check benötigt den Angular-Entwicklungsserver mit Debug-API.');});
 await page.locator('.training-card').filter({hasText:'Tool Calling'}).click();await expect(page.locator('.detail-panel .primary')).toBeDisabled();
 await page.getByRole('button',{name:'Assessment Center'}).click();await page.selectOption('#module','M02');await expect(page.getByRole('heading',{name:'Ein Schritt nach dem anderen.'})).toBeVisible();
 await page.evaluate(async()=>{await window.app.reload('questions');await window.app.beginQuiz();await window.app.evaluateQuiz();});
 assert.equal(await page.evaluate(()=>Object.keys(window.app.sessions()).length),0);assert.equal(await page.evaluate(()=>Object.keys(window.app.pending()).length),0);
 await page.selectOption('#module','M01');await expect(page.getByRole('button',{name:'Wissenstest starten →',exact:true})).toBeEnabled();
 const reload=()=>page.getByRole('button',{name:'Fragen laden / aktualisieren ↻',exact:true}).click();
 for(const mode of ['invalid','missing']){
  sourceMode=mode;await reload();await expect(page.locator('.source-status')).toContainText(mode==='invalid'?'INVALID_DATA':'FILE_NOT_FOUND');
  await page.evaluate(()=>window.app.beginQuiz());assert.equal(await page.evaluate(()=>Object.keys(window.app.sessions()).length),0);
 }
 sourceMode='ready';await reload();await expect(page.locator('.source-status')).toContainText('Zum Bestehen: 3 richtige Antworten (75 %)');
 const start=()=>page.getByRole('button',{name:'Wissenstest starten →',exact:true}).click();
 const submit=()=>page.getByRole('button',{name:'Wissenstest auswerten →',exact:true}).click();
 const fill=async(correct)=>{for(let i=0;i<3;i++){const q=questions[i],index=q.options.findIndex(o=>o.id===q.correctOptionId);await page.locator('.quiz-question').nth(i).getByRole('radio').nth(i<correct?index:(index+1)%q.options.length).check();}};
 await start();await expect(page.getByRole('button',{name:'Wissenstest auswerten →',exact:true})).toBeDisabled();
 await page.evaluate(()=>window.app.evaluateQuiz());await expect(page.locator('.notice')).toContainText('unvollständig oder ungültig');assert.equal(await page.evaluate(()=>window.app.dataset().attempts.length),0);
 await fill(2);await submit();await expect(page.locator('.quiz-result')).toContainText('2 von 3 richtig');await expect(page.locator('.quiz-result')).toContainText('Weiter üben');await expect(page.locator('.stats')).toContainText('0 / 10');
 await page.selectOption('#module','M02');await expect(page.getByRole('heading',{name:'Ein Schritt nach dem anderen.'})).toBeVisible();await page.selectOption('#module','M01');
 await page.getByRole('button',{name:'Wissenstest wiederholen ↺',exact:true}).click();await start();await fill(3);await submit();await expect(page.locator('.stats')).toContainText('1 / 10');
 await page.evaluate(()=>window.app.evaluateQuiz());assert.equal(await page.evaluate(()=>window.app.dataset().attempts.length),2);
 // Valid imported JSON remains valid regardless of rule property order.
 await page.evaluate(()=>new Promise((resolve,reject)=>{
  const r=indexedDB.open('ai-training-local',1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('attempts','readwrite'),store=tx.objectStore('attempts'),q=store.getAll();
   q.onsuccess=()=>{for(const a of q.result)store.put({...a,rule:{displayDecimals:2,pointsPerCorrect:1,threshold:{denominator:4,numerator:3},id:'single-choice-75-v1'}});};tx.oncomplete=()=>{db.close();resolve();};tx.onabort=()=>reject(tx.error);
  };
 }));
 await page.reload();await page.getByRole('button',{name:'Assessment Center'}).click();await page.evaluate(()=>{window.app=window.ng.getComponent(document.querySelector('app-root'));});await expect(page.locator('.stats')).toContainText('1 / 10');await expect(page.locator('.attempt-history details')).toHaveCount(2);
 await page.locator('.attempt-history summary').first().focus();await page.keyboard.press('Enter');const review=page.locator('.attempt-history details').first();await review.getByRole('button',{name:'Antworten und Erklärungen ansehen'}).click();await expect(review.getByRole('button',{name:'Erklärungen ausblenden'})).toHaveAttribute('aria-expanded','true');await expect(review.locator('.review-question')).toHaveCount(3);await expect(review.locator('.review-explanation')).toHaveCount(3);await expect(review).toContainText('Richtige Antwort');
 // Reviewing a saved attempt must leave the new attempt controls and answers alone.
 await start();await expect(page.locator('.quiz-question')).toHaveCount(3);await expect(page.locator('.attempt-history details').first().locator('.review-question')).toHaveCount(3);await page.getByRole('button',{name:'Versuch abbrechen'}).click();
 // A new-start read failure invalidates the previously cached qualifications immediately.
 await page.evaluate(async()=>{window.originalGet=IDBObjectStore.prototype.get;IDBObjectStore.prototype.get=function(...args){if(this.name==='meta')throw Error('simulierter Lesefehler');return window.originalGet.apply(this,args);};await window.app.beginQuiz();});
 await expect(page.getByRole('alert')).toContainText('Teststart blockiert');await expect(page.locator('.stats')).toContainText('0 / 10');assert.equal(await page.evaluate(()=>window.app.localReady()),false);assert.equal(await page.evaluate(()=>!!window.app.active()),false);assert.equal(await page.evaluate(()=>window.app.dataset()===undefined),true);
 await page.evaluate(()=>{IDBObjectStore.prototype.get=window.originalGet;});await page.getByRole('button',{name:'Speicher erneut laden ↻',exact:true}).click();await expect(page.locator('.stats')).toContainText('1 / 10');
 // Losing access during an open M01 attempt also blocks a direct completion call.
 await start();await fill(3);
 await page.evaluate(async()=>{window.originalGet=IDBObjectStore.prototype.get;IDBObjectStore.prototype.get=function(...args){if(this.name==='meta')throw Error('simulierter Lesefehler');return window.originalGet.apply(this,args);};await window.app.restore();await window.app.evaluateQuiz();});
 await expect(page.getByRole('alert')).toContainText('simulierter Lesefehler');await expect(page.locator('.stats')).toContainText('0 / 10');assert.equal(await page.evaluate(()=>window.app.localReady()),false);assert.equal(await page.evaluate(()=>Object.keys(window.app.pending()).length),0);await expect(page.getByRole('button',{name:'Wissenstest auswerten →',exact:true})).toBeDisabled();
 await page.evaluate(()=>{IDBObjectStore.prototype.get=window.originalGet;});await page.getByRole('button',{name:'Speicher erneut laden ↻',exact:true}).click();await expect(page.locator('.stats')).toContainText('1 / 10');assert.equal(await page.evaluate(()=>window.app.dataset().attempts.length),2);
 await page.getByRole('button',{name:'Versuch abbrechen',exact:true}).click();
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:width===390?844:1100});
  for(const name of ['Skill Tree','Learning Workspace','Assessment Center','Competency Dashboard','Training Administration']){
   const button=page.getByRole('button',{name});await button.focus();await page.keyboard.press('Enter');await expect(button).toHaveAttribute('aria-current','page');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px overflow in ${name}`);
  }
  await page.getByRole('button',{name:'Skill Tree'}).click();await expect(page.locator('.tree-panel')).toBeVisible();await page.screenshot({path:join(tmpdir(),`issue11-tree-${width}.png`),fullPage:true});
 }
 assert.deepEqual(errors,[]);console.log('Level gates passed: direct locked actions, empty/missing questions, incomplete submission, 2/3 fails and 3/3 passes, durable reload, reordered historical rule, read failure clears cached progress and blocks submission, retry preserves records; five views at 1440/390px and keyboard navigation.');
}finally{await browser.close();}
