import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {expect}=await import(process.env.PLAYWRIGHT_TEST_MODULE || '@playwright/test');
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=fileURLToPath(new URL('../../',import.meta.url));
const artifacts=tmpdir();
const A='a'.repeat(40),B='b'.repeat(40);let commit=A,broken=false;
const quiz=JSON.parse(await readFile(root+'modules/M01-llm-foundations/assessment/quiz.json','utf8'));
const manifest=JSON.parse(await readFile(root+'modules/M01-llm-foundations/materials.json','utf8'));
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{})});
try {
const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[],calls=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://api.github.com/**',async route=>{
 const req=route.request(),url=new URL(req.url());calls.push({url:url.href,method:req.method(),body:req.postData()});
 assert.equal(req.method(),'GET');assert.equal(req.postData(),null);
 if(url.pathname.includes('/git/ref/'))return route.fulfill({json:{ref:'refs/heads/main',object:{type:'commit',sha:commit}}});
 const path=url.pathname.split('/contents/')[1];
 let value;
 if(path.endsWith('quiz.json'))value=JSON.stringify(broken?{...quiz,questions:[]}:{...quiz,version:url.searchParams.get('ref')===A?1:2});
 else if(path.endsWith('materials.json'))value=JSON.stringify(manifest);
 else if(path==='modules/M01-llm-foundations/next.md')value='# Folgelektion\n\nAm selben Commit geladen.';
 else value='# Laufzeitmaterial\n\n<script>window.pwned=true</script>\n\n![Tracker](https://evil.invalid/pixel)\n\n[Weiter](next.md) [Python](lab.py) [Extern](https://example.org)';
 return route.fulfill({json:{type:'file',encoding:'base64',size:Buffer.byteLength(value),content:Buffer.from(value).toString('base64')}});
});
await page.goto(process.env.LEARNING_STUDIO_URL || 'http://127.0.0.1:4200');
await expect(page.locator('.training-card')).toHaveCount(9);
await page.getByRole('button',{name:'Training Administration'}).click();
await expect(page.getByRole('button',{name:'Quellen lokal speichern',exact:true})).toBeEnabled();
const configuration={schemaVersion:1,trainings:[{trainingId:'M01',content:{provider:'github-public',repository:{owner:'source',name:'materials'},ref:{kind:'branch',value:'main'},path:'modules/M01/materials.json'},questions:{provider:'github-public',repository:{owner:'source',name:'questions'},ref:{kind:'branch',value:'main'},path:'modules/M01/quiz.json'}}]};
await page.locator('#sources-config').fill(JSON.stringify(configuration));await page.getByRole('button',{name:'Quellen lokal speichern',exact:true}).click();
await expect(page.locator('.source-settings')).toContainText('Quellen lokal gespeichert');
// Invalid save keeps last valid settings, without any Git request.
await page.locator('#sources-config').fill(JSON.stringify({...configuration,trainings:[...configuration.trainings,...configuration.trainings]}));
await page.getByRole('button',{name:'Quellen lokal speichern',exact:true}).click();await expect(page.locator('.source-settings')).toContainText('trainingId');assert.equal(calls.length,0);
await page.getByRole('button',{name:'Learning Workspace'}).click();
await expect(page.locator('.lesson-list button').first()).toBeVisible();
await page.locator('.lesson-list button').first().click();await expect(page.locator('.markdown')).toContainText('Laufzeitmaterial');
await page.getByRole('link',{name:'Weiter',exact:true}).click();await expect(page.locator('.markdown')).toContainText('Folgelektion');
assert.ok(calls.at(-1).url.endsWith(`?ref=${A}`));
assert.equal(await page.evaluate(()=>window.pwned),undefined);assert.equal(await page.locator('.markdown img, .markdown script').count(),0);
await page.getByRole('button',{name:'Als gelesen markieren',exact:true}).click();await expect(page.getByRole('button',{name:'✓ Als gelesen vermerkt',exact:true})).toBeVisible();
await page.getByRole('button',{name:'Assessment Center'}).click();
await page.getByRole('button',{name:'Wissenstest starten →',exact:true}).click();await expect(page.locator('.quiz-question')).toHaveCount(4);
await expect(page.getByRole('button',{name:'Wissenstest auswerten →',exact:true})).toBeDisabled();
const radio=page.locator('.quiz-question').first().getByRole('radio').first();await radio.focus();await page.keyboard.press('ArrowRight');
await expect(page.locator('.quiz-question').first().getByRole('radio').nth(1)).toBeChecked();
commit=B;await page.getByRole('button',{name:'Fragen laden / aktualisieren ↻',exact:true}).click();await expect(page.locator('.source-status')).toContainText(B);
await expect(page.locator('.knowledge-test .source-provenance')).toContainText(A);
// Admin edits independently replace content and questions while the started attempt remains stable.
await page.getByRole('button',{name:'Training Administration'}).click();
configuration.trainings[0].questions.repository.name='new-questions';
await page.locator('#sources-config').fill(JSON.stringify(configuration));await page.getByRole('button',{name:'Quellen lokal speichern',exact:true}).click();await expect(page.locator('.source-settings')).toContainText('Quellen lokal gespeichert');
await page.getByRole('button',{name:'Assessment Center'}).click();await expect(page.locator('.source-status')).toContainText('new-questions');await expect(page.locator('.knowledge-test .source-provenance')).toContainText(A);
// Training switch returns to the same attempt and selected option.
await page.selectOption('#module','M02');await expect(page.getByRole('heading',{name:'Ein Schritt nach dem anderen.'})).toBeVisible();
await page.selectOption('#module','M01');await expect(page.locator('.quiz-question').first().getByRole('radio').nth(1)).toBeChecked();
for(let i=0;i<4;i++)await page.locator('.quiz-question').nth(i).getByRole('radio').nth([1,0,2,1][i]).check();
await page.getByRole('button',{name:'Wissenstest auswerten →',exact:true}).click();await expect(page.locator('.quiz-result')).toContainText('4 von 4 richtig');
await page.screenshot({path:join(artifacts,'issue9-assessment-desktop.png'),fullPage:true});
// A new attempt uses the refreshed commit, never old answer indices.
await page.getByRole('button',{name:'Wissenstest wiederholen ↺',exact:true}).click();await page.getByRole('button',{name:'Wissenstest starten →',exact:true}).click();await expect(page.locator('.knowledge-test .source-provenance')).toContainText(B);await expect(page.getByRole('radio',{checked:true})).toHaveCount(0);
await page.getByRole('button',{name:'Versuch abbrechen',exact:true}).click();
// New malformed commit blocks test start; valid refresh recovers without a rebuild.
commit='c'.repeat(40);broken=true;await page.getByRole('button',{name:'Fragen laden / aktualisieren ↻',exact:true}).click();await expect(page.locator('.source-status')).toContainText('INVALID_DATA');await expect(page.getByRole('button',{name:'Wissenstest starten →',exact:true})).toHaveCount(0);
commit='d'.repeat(40);broken=false;await page.getByRole('button',{name:'Fragen laden / aktualisieren ↻',exact:true}).click();await expect(page.getByRole('button',{name:'Wissenstest starten →',exact:true})).toBeVisible();
// Configuration survives a full reload; demo legacy data is retained verbatim.
await page.evaluate(()=>localStorage.setItem('ai-training-demo-v1','{"passed":["M01"]}'));
await page.reload();await page.getByRole('button',{name:'Training Administration'}).click();await expect(page.locator('#sources-config')).toHaveValue(/new-questions/);assert.equal(await page.evaluate(()=>localStorage.getItem('ai-training-demo-v1')),'{"passed":["M01"]}');
await page.setViewportSize({width:390,height:844});
for(const view of ['Training Administration','Learning Workspace','Assessment Center','Skill Tree']){
 await page.getByRole('button',{name:view}).click();
 if(view==='Assessment Center')await page.getByRole('button',{name:'Wissenstest starten →',exact:true}).click();
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`mobile overflow: ${view}`);
 await page.screenshot({path:join(artifacts,`issue9-${view.replaceAll(' ','-')}-mobile.png`),fullPage:true});
}
assert.deepEqual(errors,[]);console.log(`Browser checks passed: ${calls.length} read-only API calls, two repositories, commit refresh, pinned material links, immutable attempt, source change, locked training, keyboard, validation errors, retry, IndexedDB configuration reload, untouched legacy data; 1440/390 px, no overflow/runtime errors.`);
} finally {await browser.close();}
