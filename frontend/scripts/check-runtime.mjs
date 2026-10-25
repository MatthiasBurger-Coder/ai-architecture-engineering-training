import assert from 'node:assert/strict';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {trainings} from '../src/app/catalog.ts';

const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {expect}=await import(process.env.PLAYWRIGHT_TEST_MODULE || '@playwright/test');
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM?{executablePath:process.env.PLAYWRIGHT_CHROMIUM}:{})});
const externalRequests=[];
try {
 const context=await browser.newContext({viewport:{width:1440,height:1100}});
 await context.route('https://**',async route=>{externalRequests.push(route.request().url());await route.abort();});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.LEARNING_STUDIO_URL || 'http://127.0.0.1:4200');
 await expect(page.locator('.training-card')).toHaveCount(trainings.length);
 await page.getByRole('button',{name:'Learning Workspace'}).click();
 await expect(page.locator('.lesson-list button').first()).toBeVisible();
 await page.locator('.lesson-list button').first().click();
 await expect(page.locator('.markdown')).not.toBeEmpty();
 await page.getByRole('button',{name:'Assessment Center'}).click();
 await expect(page.locator('.quiz-question')).toHaveCount(4);
 await page.getByRole('button',{name:'Wissenstest starten →',exact:true}).click();
 await expect(page.locator('.knowledge-test .quiz-question')).toHaveCount(4);
 await page.setViewportSize({width:390,height:844});
 for(const view of ['Skill Tree','Learning Workspace','Assessment Center','Training Administration']) {
  await page.getByRole('button',{name:view}).click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`mobile overflow: ${view}`);
  await page.screenshot({path:join(tmpdir(),`local-checkout-${view.replaceAll(' ','-')}-mobile.png`),fullPage:true});
 }
 assert.deepEqual(externalRequests,[],'application must not send requests outside its origin');
 assert.deepEqual(errors,[]);
 console.log('Browser checks passed: local checkout materials and quiz loaded; no external requests, mobile overflow, or runtime errors.');
 await context.close();
} finally {await browser.close();}
