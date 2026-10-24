import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { MaterialManifest, QuestionSet, ResolvedSource } from './contracts';
import { SourceStore, type SourceKind } from './source-store';
import { defaultSources } from './default-sources';
import { settings } from './source-settings';
import { validateConfiguration } from './source-validation';
import { renderMaterial } from './material-renderer';
import { startAttempt, grade, result, type Attempt } from './quiz';
import { trainings } from './catalog';
import { normalize, status, decide, type Progress } from './progress';
type Material = MaterialManifest['materials'][number];
@Component({selector:'app-root',standalone:true,imports:[FormsModule],templateUrl:'./app.html'})
export class App {
  readonly trainings=trainings;
  readonly nav=[{id:'tree',icon:'⌘',label:'Skill Tree'},{id:'learn',icon:'▤',label:'Learning Workspace'},{id:'assess',icon:'◇',label:'Assessment Center'},{id:'skills',icon:'◉',label:'Competency Dashboard'},{id:'admin',icon:'⊞',label:'Training Administration'}];
  view=signal('tree'); selected=signal(trainings[0]); filter=signal('all'); query=signal('');
  progress=signal<Progress>(this.restore()); notice=signal(''); storageWarning=signal('');
  sourceRevision=signal(0);
  sources=new SourceStore(undefined,()=>this.sourceRevision.update(n=>n+1));
  configText=JSON.stringify(defaultSources,null,2); configNotice=signal(''); settingsReady=signal(false); saving=signal(false);
  article=signal(''); currentPath=signal(''); articleError=signal(''); articleSource:ResolvedSource|undefined;
  loading=signal(false); checks=[false,false,false]; request=0;
  sessions=signal<Record<string,Attempt>>({});
  answers=signal<number[]>([]);
  active=computed(()=>this.sessions()[this.selected().id]);
  quiz=computed(()=>this.active()?.snapshot);
  quizResult=computed(()=>result(this.selected().id,this.progress().quizzes[this.selected().id]));
  required(count:number){return Math.ceil(3*count/4);}
  answered=computed(()=>this.quiz()?.questions.filter((_,i)=>Number.isInteger(this.answers()[i])).length || 0);
  sourceState(kind:SourceKind){this.sourceRevision();return this.sources.state(this.selected().id,kind);}
  questionData(){const s=this.sourceState('questions');return s.state==='ready'?s.data as QuestionSet:undefined;}
  provenance(kind:SourceKind){const s=this.sourceState(kind);return s.state==='ready'?this.describe(s.provenance):'';}
  describe(p:ResolvedSource){const s=p.source;return `${s.repository.owner}/${s.repository.name} · ${s.ref.kind}: ${s.ref.value} · ${s.path} · Commit ${p.commit}`;}
  sourceMessage(kind:SourceKind){
    const s=this.sourceState(kind);
    if(s.state==='idle')return 'Keine Daten geladen. Quelle konfigurieren oder laden.';
    if(s.state==='loading')return 'Quelle wird geladen …';
    if(s.state==='error')return `${s.code}: ${s.message}${s.retryAt?' Erneut möglich ab '+s.retryAt:''}`;
    return this.describe(s.provenance);
  }
  async reload(kind:SourceKind){
    if(!this.settingsReady())return;
    if(kind==='content'){this.request++;this.article.set('');this.articleError.set('');this.currentPath.set('');this.loading.set(false);}
    await this.sources.load(this.selected().id,kind);
  }
  async saveSources(){
    if(!this.settingsReady() || this.saving())return;
    this.saving.set(true);
    try {
      const next=validateConfiguration(JSON.parse(this.configText));
      await settings(next);
      this.sources.configure(next);this.request++;this.article.set('');this.articleError.set('');this.currentPath.set('');this.loading.set(false);
      this.configNotice.set('Quellen lokal gespeichert. Die betroffenen Quellen können jetzt neu geladen werden. Laufende Tests behalten ihren Stand.');
    }catch(e){this.configNotice.set(e instanceof Error?e.message:'Quellen konnten nicht gespeichert werden.');}
    finally{this.saving.set(false);}
  }
  beginQuiz(){
    const source=this.sourceState('questions');
    if(source.state!=='ready' || this.state(this.selected().id)==='locked' || this.active())return;
    this.sessions.update(s=>({...s,[this.selected().id]:startAttempt(source.data as QuestionSet,source.provenance)}));
    this.answers.set([]);this.notice.set('');
  }
  answer(index:number,value:number){
    if(!this.active() || this.quizResult())return;
    this.answers.update(a=>{const next=[...a];next[index]=value;return next;});
    this.sessions.update(s=>({...s,[this.selected().id]:{...this.active()!,answers:[...this.answers()]}}));
  }
  evaluateQuiz(){
    const id=this.selected().id,attempt=this.active();
    if(!attempt || this.state(id)==='locked' || this.quizResult())return;
    if(!grade(attempt.snapshot,this.answers())){this.notice.set('Bitte beantworte zuerst alle Fragen.');return;}
    this.persist({...this.progress(),quizzes:{...this.progress().quizzes,[id]:structuredClone({...attempt,answers:this.answers()})}});
    this.notice.set('Ergebnis nur in dieser Sitzung. Dauerhafte Speicherung ist noch nicht verfügbar.');
  }
  retryQuiz(){
    if(this.state(this.selected().id)==='locked')return;
    const attempts={...this.progress().quizzes};delete attempts[this.selected().id];
    const sessions={...this.sessions()};delete sessions[this.selected().id];this.sessions.set(sessions);
    this.persist({...this.progress(),quizzes:attempts});this.answers.set([]);this.notice.set('');
  }
  quizAnswers(){return this.progress().quizzes[this.selected().id]?.answers || this.answers();}
  visible=computed(()=>trainings.filter(t=>(this.filter()==='all'||this.state(t.id)===this.filter()) && `${t.id} ${t.title} ${t.skills.join(' ')}`.toLowerCase().includes(this.query().toLowerCase())));
  files=computed(()=>{this.sourceRevision();const s=this.sources.state(this.selected().id,'content');return s.state==='ready'?(s.data as MaterialManifest).materials:[];});
  constructor(){void this.initialize();}
  async initialize(){
    try {this.sources.configure(await settings() || defaultSources);this.configText=JSON.stringify(this.sources.configuration,null,2);}
    catch(e){this.configNotice.set('Quellenkonfiguration nicht lesbar. '+(e instanceof Error?e.message:''));this.storageWarning.set('Quellen-Speicher nicht verfügbar. Einstellungen in Training Administration prüfen; keine automatische Ersatzquelle.');}
    this.settingsReady.set(true);this.loadIfIdle();
  }
  restore(){return normalize(null);}
  persist(p:Progress){this.progress.set(p);}
  state(id:string){return status(id,this.progress());}
  label(id:string){return {passed:'Bestanden',available:'Verfügbar',locked:'Gesperrt'}[this.state(id)];}
  select(id:string){this.selected.set(trainings.find(t=>t.id===id)!);this.checks=[false,false,false];this.answers.set(this.sessions()[id]?.answers || []);this.notice.set('');this.article.set('');this.articleError.set('');this.currentPath.set('');this.loading.set(false);this.request++;if(this.view()==='learn' || this.view()==='assess')this.loadIfIdle();}
  navigate(view:string){this.view.set(view);this.notice.set('');this.loadIfIdle();}
  loadIfIdle(){if(this.view()==='learn' || this.view()==='assess'){const kind=this.view()==='learn'?'content':'questions';if(this.sourceState(kind).state==='idle')void this.reload(kind);}}
  learn(){if(this.state(this.selected().id)==='locked')return;this.navigate('learn');const f=this.files()[0];if(f)void this.open(f);}
  async open(file:Pick<Material,'path'>){
    const source=this.sourceState('content');if(source.state!=='ready')return;
    const token=++this.request;this.articleSource=structuredClone(source.provenance);this.currentPath.set(file.path);this.loading.set(true);this.article.set('');this.articleError.set('');
    try {
      const markdown=await this.sources.client.text(source.provenance,file.path);
      const html=await renderMaterial(markdown,file.path);
      if(token===this.request)this.article.set(html);
    }catch(e){if(token===this.request)this.articleError.set(e instanceof Error?e.message:'Material konnte nicht geladen werden.');}
    finally{if(token===this.request)this.loading.set(false);}
  }
  articleClick(event:MouseEvent){
    const link=(event.target as HTMLElement).closest('a[href^="#material/"]');
    if(link){event.preventDefault();void this.open({path:link.getAttribute('href')!.slice(10)});}
  }
  readKey(path:string){const s=this.sourceState('content');return s.state==='ready'?JSON.stringify([this.selected().id,s.provenance.source.repository.owner.toLowerCase(),s.provenance.source.repository.name.toLowerCase(),s.provenance.commit,path]):'';}
  isRead(path:string){return this.progress().read.includes(this.readKey(path));}
  markRead(){const key=this.readKey(this.currentPath());if(this.article() && key && !this.progress().read.includes(key))this.persist({...this.progress(),read:[...this.progress().read,key]});}
  submit(){const p=decide(this.selected().id,this.progress(),this.checks);if(p===this.progress()){this.notice.set('Für die Demo-Freigabe muss der Wissenstest bestanden sein und alle drei simulierten Nachweise müssen bestätigt sein.');return;}this.persist(p);this.notice.set(`${this.selected().id}: Demo-Gate bestanden. Das nächste Training ist jetzt verfügbar.`);}
  reset(){this.persist(normalize(null));this.select('M01');this.sessions.set({});this.answers.set([]);this.checks=[false,false,false];this.notice.set('Sitzungsfortschritt zurückgesetzt. Vorhandene Demo-Altdaten bleiben unverändert.');}
}
