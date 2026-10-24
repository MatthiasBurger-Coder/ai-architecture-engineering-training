import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {GitSourceClient} from './git-source.ts';
import {SourceStore} from './source-store.ts';
import {SourceError,validateSource,validateConfiguration,validateQuestions,validateManifest} from './source-validation.ts';
import {sameRepository,separateRepositories,manifest,questionSet,invalidSources,invalidQuestions} from './contracts.fixtures.ts';
import {startAttempt,grade} from './quiz.ts';
import {renderMaterial} from './material-renderer.ts';
const A='a'.repeat(40),B='b'.repeat(40);
const source=sameRepository.trainings[0].content;
const response=(data:unknown,status=200,headers:Record<string,string>={})=>new Response(JSON.stringify(data),{status,headers});
const file=(value:unknown)=>{const text=typeof value==='string'?value:JSON.stringify(value);const bytes=new TextEncoder().encode(text);return {type:'file',encoding:'base64',size:bytes.length,content:btoa(String.fromCharCode(...bytes))};};
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
test('exact branch, nested branch, direct commit, lightweight and annotated tag resolution',async()=>{
 const {fetcher,calls}=mock(url=>url.includes('/git/ref/')?response({ref:url.includes('/tags/')?'refs/tags/v1':'refs/heads/feature/training',object:{type:url.includes('/tags/')?'tag':'commit',sha:A}}):url.includes('/git/tags/')?response({object:{type:'commit',sha:B}}):response({sha:A}));
 const client=new GitSourceClient(fetcher);
 assert.equal((await client.resolve({...source,ref:{kind:'branch',value:'feature/training'}})).commit,A);
 assert.equal((await client.resolve({...source,ref:{kind:'tag',value:'v1'}})).commit,B);
 assert.equal((await client.resolve({...source,ref:{kind:'commit',value:A}})).commit,A);
 assert.ok(calls[0].url.endsWith('/git/ref/heads/feature/training'));
 const light=new GitSourceClient(mock(()=>response({ref:'refs/tags/v1',object:{type:'commit',sha:A}})).fetcher);
 assert.equal((await light.resolve({...source,ref:{kind:'tag',value:'v1'}})).commit,A);
 const bad=new GitSourceClient(mock(()=>response({ref:'refs/tags/v1',object:{type:'tag',sha:A}})).fetcher);
 await assert.rejects(bad.resolve({...source,ref:{kind:'tag',value:'v1'}}),{code:'INVALID_DATA'});
 const prefix=new GitSourceClient(mock(()=>response([{ref:'refs/heads/main-extra'}])).fetcher);
 await assert.rejects(prefix.resolve(source),{code:'INVALID_DATA'});
});
test('separate and shared repositories load independently; explicit refresh pins new commits without mutating an attempt',async()=>{
 for(const config of [sameRepository,separateRepositories]) {
  let commit=A;
  const {fetcher,calls}=mock(url=>{
   if(url.includes('/git/ref/'))return response({ref:url.includes('/tags/')?'refs/tags/v1.0':'refs/heads/main',object:{type:'commit',sha:commit}});
   if(url.includes('/contents/'))return response(file(url.includes('quiz.json')?{...questionSet,version:commit===A?1:2}:manifest));
   return response({},404);
  });
  const store=new SourceStore(new GitSourceClient(fetcher));store.configure(config);
  await Promise.all([store.load('M01','content'),store.load('M01','questions')]);
  const q=store.state('M01','questions');assert.equal(q.state,'ready');if(q.state!=='ready')throw Error();
  const active=startAttempt(q.data as typeof questionSet,q.provenance);
  active.answers=[0,0,0,0];commit=B;
  await store.load('M01','questions');
  assert.equal(active.provenance.commit,A);assert.equal(active.snapshot.version,1);assert.equal(grade(active.snapshot,active.answers)?.passed,true);
  const next=store.state('M01','questions');assert.equal(next.state,'ready');if(next.state==='ready')assert.equal(next.provenance.commit,B);
  const content=store.state('M01','content');if(content.state!=='ready')throw Error();
  await store.client.text(content.provenance,'modules/M01/README.md');
  assert.ok(calls.at(-1)!.url.endsWith(`?ref=${A}`));
  if(config===separateRepositories)assert.ok(calls.some(c=>c.url.includes('/example/questions/')));
  for(const {url,init} of calls){assert.ok(url.startsWith('https://api.github.com/repos/'));assert.equal(init?.method,'GET');assert.equal(init?.cache,'no-store');assert.equal(init?.credentials,'omit');assert.equal(init?.referrerPolicy,'no-referrer');assert.equal(init?.body,undefined);assert.ok(!url.includes('answers'));}
 }
});
test('old async responses cannot overwrite newer configuration; broken content does not block questions',async()=>{
 let release!:(r:Response)=>void;
 const {fetcher}=mock(url=>url.includes('/git/ref/')?new Promise<Response>(r=>release=r):response(file(questionSet)));
 const store=new SourceStore(new GitSourceClient(fetcher));store.configure(sameRepository);
 const old=store.load('M01','content');store.configure({schemaVersion:1,trainings:[]});
 release(response({ref:'refs/heads/main',object:{type:'commit',sha:A}}));await old;
 assert.equal(store.state('M01','content').state,'idle');
 const broken=mock(url=>url.includes('/git/ref/')?response({ref:'refs/heads/main',object:{type:'commit',sha:A}}):url.includes('quiz.json')?response(file(questionSet)):response({},404));
 const independent=new SourceStore(new GitSourceClient(broken.fetcher));independent.configure(sameRepository);
 await Promise.all([independent.load('M01','content'),independent.load('M01','questions')]);
 assert.equal(independent.state('M01','content').state,'error');assert.equal(independent.state('M01','questions').state,'ready');
});
test('network, missing files, permissions and API failures yield typed errors; rate limits prevent early retry',async()=>{
 for(const [status,code] of [[404,'REF_NOT_FOUND'],[401,'ACCESS_DENIED'],[403,'ACCESS_DENIED'],[500,'NETWORK'],[418,'INVALID_DATA']] as const) {
  const client=new GitSourceClient(mock(()=>response({},status)).fetcher);await assert.rejects(client.resolve(source),{code});
 }
 const offline=new GitSourceClient(async()=>{throw Error('offline');});await assert.rejects(offline.resolve(source),{code:'NETWORK'});
 const limit=mock(()=>response({},429,{'retry-after':'60'}));const client=new GitSourceClient(limit.fetcher);
 await assert.rejects(client.resolve(source),(e:unknown)=>e instanceof SourceError&&e.code==='RATE_LIMIT'&&!!e.retryAt);
 await assert.rejects(client.resolve(source),{code:'RATE_LIMIT'});assert.equal(limit.calls.length,1);
 const missing=new GitSourceClient(mock(()=>response({},404)).fetcher);await assert.rejects(missing.text({source,commit:A}),{code:'FILE_NOT_FOUND'});
});
test('invalid files, malformed JSON, empty/invalid UTF-8 and oversized content are refused',async()=>{
 const values=[[],{...file('ok'),type:'dir'},{...file('ok'),encoding:'none'},file(' '),{...file('ok'),size:1048577},{type:'file',encoding:'base64',size:1,content:'/w=='},{...file('ok'),content:'!bad!'}];
 for(const value of values){const client=new GitSourceClient(mock(()=>response(value)).fetcher);await assert.rejects(client.text({source,commit:A}),{code:'INVALID_DATA'});}
 const client=new GitSourceClient(mock(()=>response(file('{broken'))).fetcher);await assert.rejects(client.json({source,commit:A}),{code:'INVALID_DATA'});
});
test('failed refresh clears latest data; invalid new questions never become ready; retry succeeds',async()=>{
 let payload:unknown=questionSet;let commit=A;
 const {fetcher}=mock(url=>url.includes('/git/ref/')?response({ref:'refs/heads/main',object:{type:'commit',sha:commit}}):response(file(payload)));
 const store=new SourceStore(new GitSourceClient(fetcher));store.configure(sameRepository);await store.load('M01','questions');assert.equal(store.state('M01','questions').state,'ready');
 commit=B;payload={...questionSet,questions:[]};await store.load('M01','questions');assert.equal(store.state('M01','questions').state,'error');
 commit='c'.repeat(40);payload=questionSet;await store.load('M01','questions');assert.equal(store.state('M01','questions').state,'ready');
});
test('Markdown blocks active HTML and automatic resources; relative Markdown links use the pinned adapter route',async()=>{
 const html=await renderMaterial('<script>alert(1)</script>\n\n<img src="https://evil.test/x">\n\n![track](https://evil.test/pixel)\n\n[local](../next.md) [code](test.py) [external](https://example.org) [bad](javascript:alert%281%29)','modules/M01/README.md');
 assert.ok(!/<script|<img|<iframe/i.test(html));assert.ok(html.includes('href="#material/modules/next.md"'));assert.ok(html.includes('noopener noreferrer'));assert.ok(!html.includes('href="javascript:'));
});
