import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {GitSourceClient} from './git-source.ts';
import {SourceStore} from './source-store.ts';
import {SourceError,validateSource,validateConfiguration,validateQuestions,validateManifest} from './source-validation.ts';
import {sameRepository,separateRepositories,manifest,questionSet,invalidSources,invalidQuestions} from './contracts.fixtures.ts';
import {startAttempt,grade} from './quiz.ts';
import {renderMaterial} from './material-renderer.ts';
const A='a'.repeat(40);
const source=sameRepository.trainings[0].content;
const response=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status});
function mock(handler:(url:string)=>Response|Promise<Response>) {
 const calls:{url:string,init:RequestInit|undefined}[]=[];
 const fetcher:typeof fetch=async(input,init)=>{const url=String(input);calls.push({url,init});return handler(url);};
 return {fetcher,calls};
}
test('strict source, configuration, manifest and question validation rejects untrusted values',()=>{
 for(const c of invalidSources)assert.throws(()=>c.id==='S-duplicate'||c.id==='S-training'?validateConfiguration(c.payload):validateSource(c.payload));
 for(const c of invalidQuestions)assert.throws(()=>validateQuestions(c.payload,'M01'));
 for(const value of [null,{}, {...questionSet,extra:1},{...questionSet,questions:Array(2)}, {...questionSet,version:Infinity}])assert.throws(()=>validateQuestions(value,'M01'));
 for(const value of [{...manifest,trainingId:'M02'},{...manifest,materials:[]},{...manifest,materials:[manifest.materials[0],manifest.materials[0]]}])assert.throws(()=>validateManifest(value,'M01'));
 for(const ref of ['../main','main.lock','a//b','a@{b','x y','.hidden','a\\b','a?b','a.','a/.x','@'])assert.throws(()=>validateSource({...source,ref:{kind:'branch',value:ref}}));
 for(const path of ['/x.json','../x.json','a/%2e.json','https://x.json','a\\b.json'])assert.throws(()=>validateSource({...source,path}));
 assert.deepEqual(validateConfiguration(separateRepositories),separateRepositories);
});
test('source resolution is local and never makes a network request',async()=>{
 let calls=0;const client=new GitSourceClient(async()=>{calls++;throw Error('unexpected request');});
 const resolved=await client.resolve(source);assert.equal(resolved.commit,'0'.repeat(40));assert.equal(calls,0);
});
test('checked-out manifest, quiz and Markdown load same-origin and preserve an active attempt',async()=>{
 for(const config of [sameRepository,separateRepositories]) {
  let version=1;
  const {fetcher,calls}=mock(url=>url.includes('quiz.json')?response({...questionSet,version}):url.includes('materials.json')?response(manifest):new Response('# Lokaler Inhalt'));
  const store=new SourceStore(new GitSourceClient(fetcher));store.configure(config);
  await Promise.all([store.load('M01','content'),store.load('M01','questions')]);
  const q=store.state('M01','questions');assert.equal(q.state,'ready');if(q.state!=='ready')throw Error();
  const active=startAttempt(q.data as typeof questionSet,q.provenance);active.answers=[0,0,0,0];version=2;
  await store.load('M01','questions');assert.equal(active.snapshot.version,1);assert.equal(grade(active.snapshot,active.answers)?.passed,true);
  const next=store.state('M01','questions');assert.equal(next.state,'ready');if(next.state==='ready')assert.equal(next.data.version,2);
  const content=store.state('M01','content');if(content.state!=='ready')throw Error();
  assert.equal(await store.client.text(content.provenance,'modules/M01-llm-foundations/README.md'),'# Lokaler Inhalt');
  assert.ok(calls.every(c=>new URL(c.url).origin==='http://localhost'));
  assert.ok(calls.every(c=>!/(api\\.)?github\\.com|raw\\.githubusercontent/.test(c.url)));
 }
});
test('a stale local response cannot overwrite a newer source configuration; content errors are isolated',async()=>{
 let release!:(r:Response)=>void;
 const {fetcher}=mock(url=>url.includes('materials.json')?new Promise<Response>(r=>release=r):response(questionSet));
 const store=new SourceStore(new GitSourceClient(fetcher));store.configure(sameRepository);
 const old=store.load('M01','content');await Promise.resolve();store.configure({schemaVersion:1,trainings:[]});
 release(response(manifest));await old;assert.equal(store.state('M01','content').state,'idle');
 const broken=mock(url=>url.includes('quiz.json')?response(questionSet):response({},404));
 const independent=new SourceStore(new GitSourceClient(broken.fetcher));independent.configure(sameRepository);
 await Promise.all([independent.load('M01','content'),independent.load('M01','questions')]);
 assert.equal(independent.state('M01','content').state,'error');assert.equal(independent.state('M01','questions').state,'ready');
});
test('missing and offline checkout files yield typed local errors',async()=>{
 const missing=new GitSourceClient(mock(()=>response({},404)).fetcher);
 await assert.rejects(missing.text({source,commit:A}),{code:'FILE_NOT_FOUND'});
 const offline=new GitSourceClient(async()=>{throw Error('offline');});
 await assert.rejects(offline.text({source,commit:A}),(e:unknown)=>e instanceof SourceError&&e.code==='NETWORK');
});
test('local text rejects empty and oversized files and JSON parsing rejects malformed data',async()=>{
 for(const value of ['', ' '.repeat(20), 'x'.repeat(1048577)]) {
  const client=new GitSourceClient(mock(()=>new Response(value)).fetcher);await assert.rejects(client.text({source,commit:A}),{code:'INVALID_DATA'});
 }
 const client=new GitSourceClient(mock(()=>new Response('{broken')).fetcher);await assert.rejects(client.json({source,commit:A}),{code:'INVALID_DATA'});
});
test('failed refresh clears latest data; invalid new questions never become ready; retry succeeds',async()=>{
 let payload:unknown=questionSet;
 const {fetcher}=mock(url=>new Response(url.includes('quiz.json')?JSON.stringify(payload):JSON.stringify(manifest)));
 const store=new SourceStore(new GitSourceClient(fetcher));store.configure(sameRepository);await store.load('M01','questions');assert.equal(store.state('M01','questions').state,'ready');
 payload={...questionSet,questions:[]};await store.load('M01','questions');assert.equal(store.state('M01','questions').state,'error');
 payload=questionSet;await store.load('M01','questions');assert.equal(store.state('M01','questions').state,'ready');
});
test('Markdown blocks active HTML and automatic resources; relative Markdown links use the local adapter route',async()=>{
 const html=await renderMaterial('<script>alert(1)</script>\n\n<img src="https://evil.test/x">\n\n![track](https://evil.test/pixel)\n\n[local](../next.md) [code](test.py) [external](https://example.org) [bad](javascript:alert%281%29)','modules/M01/README.md');
 assert.ok(!/<script|<img|<iframe/i.test(html));assert.ok(html.includes('href="#material/modules/next.md"'));assert.ok(html.includes('noopener noreferrer'));assert.ok(!html.includes('href="javascript:'));
});
