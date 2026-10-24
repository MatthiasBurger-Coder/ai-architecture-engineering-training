import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { MaterialManifest, QuestionSet, ResolvedSource, CompletedAttempt, ReadMarker, LocalDataset, TrainingId } from './contracts';
import { SourceStore, type SourceKind } from './source-store';
import { defaultSources } from './default-sources';
import { settings } from './source-settings';
import { validateConfiguration } from './source-validation';
import { renderMaterial } from './material-renderer';
import { startAttempt, result, completeAttempt, resumeAttempt, type Attempt } from './quiz';
import { trainings } from './catalog';
import { emptyProgress, status, fromHistory, ids, type Progress } from './progress';
import { restoreLocal, migrate, saveAttempt, saveRead, importLocal, recoveryExport } from './local-store';
import { legacyKey, readIdentity } from './local-data';
type Material = MaterialManifest['materials'][number];
@Component({selector:'app-root',standalone:true,imports:[FormsModule],templateUrl:'./app.html'})
export class App {
  readonly trainings=trainings;
  readonly nav=[{id:'tree',icon:'⌘',label:'Skill Tree'},{id:'learn',icon:'▤',label:'Learning Workspace'},{id:'assess',icon:'◇',label:'Assessment Center'},{id:'skills',icon:'◉',label:'Competency Dashboard'},{id:'admin',icon:'⊞',label:'Training Administration'}];
  view=signal('tree'); selected=signal(trainings[0]); filter=signal('all'); query=signal('');
  progress=signal<Progress>(emptyProgress()); notice=signal(''); storageWarning=signal(''); migrationWarning=signal('');
  dataset=signal<LocalDataset|undefined>(undefined); localReady=signal(false); localBusy=signal(false);
  completed=signal<Record<string,CompletedAttempt>>({}); pending=signal<Record<string,CompletedAttempt>>({}); pendingRead=signal<ReadMarker[]>([]);
  hasPending=computed(()=>Object.keys(this.pending()).length>0 || this.pendingRead().length>0);
  importText=''; backupSources=''; localNotice=signal('');
  history=computed(()=>this.dataset()?.attempts.filter(a=>a.trainingId===this.selected().id).sort((a,b)=>b.completedAt.localeCompare(a.completedAt)||b.id.localeCompare(a.id)) || []);
  sourceRevision=signal(0);
  sources=new SourceStore(undefined,()=>this.sourceRevision.update(n=>n+1));
  configText=JSON.stringify(defaultSources,null,2); configNotice=signal(''); settingsReady=signal(false); saving=signal(false);
  article=signal(''); currentPath=signal(''); articleError=signal(''); articleSource:ResolvedSource|undefined;
  loading=signal(false); request=0;
  sessions=signal<Record<string,Attempt>>({});
  answers=signal<number[]>([]);
  active=computed(()=>this.sessions()[this.selected().id]);
  quiz=computed(()=>this.active()?.snapshot);
  quizResult=computed(()=>this.active() && this.completed()[this.active()!.id]?result(this.selected().id,this.active()):null);
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
  async beginQuiz(){
    if(!this.localReady() || this.localBusy() || this.active())return;
    this.localBusy.set(true);
    try {
      await this.refreshLocal();
      const source=this.sourceState('questions'),id=this.selected().id;
      if(source.state!=='ready' || this.state(id)==='locked')return;
      const attempt=startAttempt(source.data as QuestionSet,source.provenance);
      attempt.prerequisites=ids.slice(0,ids.indexOf(id)).map(trainingId=>({trainingId:trainingId as TrainingId,attemptId:this.dataset()!.attempts.find(a=>a.trainingId===trainingId && a.score.passed)!.id}));
      this.sessions.update(s=>({...s,[id]:attempt}));this.answers.set([]);this.notice.set('');
    }catch(e){this.storageWarning.set('Teststart blockiert: '+String(e));}finally{this.localBusy.set(false);}
  }
  answer(index:number,value:number){
    if(!this.active() || this.quizResult())return;
    this.answers.update(a=>{const next=[...a];next[index]=value;return next;});
    this.sessions.update(s=>({...s,[this.selected().id]:{...this.active()!,answers:[...this.answers()]}}));
  }
  async evaluateQuiz(){
    const id=this.selected().id,attempt=this.active();
    if(!attempt || this.localBusy() || this.state(id)==='locked' || this.quizResult())return;
    try {
      const completed=completeAttempt({...attempt,answers:this.answers()});
      this.completed.update(s=>({...s,[completed.id]:completed}));
      this.pending.update(s=>({...s,[completed.id]:completed}));
      await this.savePending();
    }catch(e){this.notice.set(String(e));}
  }
  async savePending(){
    if(this.localBusy())return;
    this.localBusy.set(true);
    try {
      for(const a of Object.values(this.pending())){await saveAttempt(a);this.pending.update(s=>{const next={...s};delete next[a.id];return next;});}
      for(const r of this.pendingRead()){await saveRead(r);this.pendingRead.update(rows=>rows.filter(x=>readIdentity(x)!==readIdentity(r)));}
      await this.refreshLocal();this.notice.set('Dauerhaft lokal gespeichert.');
    }catch(e){this.storageWarning.set('Nicht gespeichert bzw. Wiederherstellung noch offen: '+String(e)+' Ergebnis bleibt in dieser Sitzung; erneut speichern.');}
    finally{this.localBusy.set(false);}
  }
  retryQuiz(){
    if(this.pending()[this.active()?.id || '']){this.notice.set('Bitte das Ergebnis zuerst erneut speichern.');return;}
    const sessions={...this.sessions()};delete sessions[this.selected().id];this.sessions.set(sessions);
    this.answers.set([]);this.notice.set('');
  }
  reviewAttempt(a:CompletedAttempt){if(this.active() && !this.quizResult() || this.pending()[this.active()?.id || ''])return;this.sessions.update(s=>({...s,[a.trainingId]:resumeAttempt(a)}));this.completed.update(s=>({...s,[a.id]:a}));this.answers.set(this.sessions()[a.trainingId].answers);}
  quizAnswers(){return this.active()?.answers || this.answers();}
  visible=computed(()=>trainings.filter(t=>(this.filter()==='all'||this.state(t.id)===this.filter()) && `${t.id} ${t.title} ${t.skills.join(' ')}`.toLowerCase().includes(this.query().toLowerCase())));
  files=computed(()=>{this.sourceRevision();const s=this.sources.state(this.selected().id,'content');return s.state==='ready'?(s.data as MaterialManifest).materials:[];});
  constructor(){void this.initialize();}
  async initialize(){
    try {this.sources.configure(await settings() || defaultSources);this.configText=JSON.stringify(this.sources.configuration,null,2);}
    catch(e){this.configNotice.set('Quellenkonfiguration nicht lesbar. '+String(e));this.storageWarning.set('Quellen-Speicher nicht verfügbar. Einstellungen und Wiederherstellung in Training Administration prüfen.');}
    this.settingsReady.set(true);await this.restore();this.loadIfIdle();
  }
  async refreshLocal(){
    const restored=await restoreLocal();this.dataset.set(restored.dataset);
    this.progress.set(fromHistory(restored.dataset.attempts,restored.dataset.read));this.localReady.set(true);
    const problems=[...restored.problems];if(restored.dataset.legacy.some(x=>x.status==='corrupt'))problems.push('Demo-Altdaten beschädigt; unverändert im Archiv erhalten.');
    this.storageWarning.set([problems.length?'Wiederherstellung: '+problems.join(' · ')+' Originale bleiben erhalten. Rohdaten in Training Administration exportieren.':'',this.migrationWarning()].filter(Boolean).join(' · '));
    const archive=restored.dataset.legacy[0];
    if(archive)this.localNotice.set(`Demo-Altdaten erhalten (${archive.status}). Kein qualifizierter Verlauf; neue Levels beginnen ohne historische Nachweise bei M01.`);
  }
  async restore(){
    let migrationError='';
    try{await migrate(localStorage.getItem(legacyKey));}catch(e){migrationError='Migration blockiert: '+String(e);}
    this.migrationWarning.set(migrationError);
    try{await this.refreshLocal();}catch(e){this.localReady.set(false);this.progress.set(emptyProgress());this.storageWarning.set('Wiederherstellung blockiert: '+String(e)+' Vorhandene Daten bleiben erhalten.');}

  }
  download(name:string,value:unknown){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=name;link.click();URL.revokeObjectURL(url);}
  async exportLocal(){try{await this.refreshLocal();this.download('learning-studio-v1.json',this.dataset());await this.exportRecovery();}catch(e){this.localNotice.set('Sicherung nicht vollständig auswertbar: '+String(e));await this.exportRecovery();}}
  async exportRecovery(){try{let legacy:unknown;try{legacy=localStorage.getItem(legacyKey);}catch(e){legacy={error:String(e)};}this.download('learning-studio-recovery.json',{kind:'raw-recovery-not-importable',legacy,database:await recoveryExport()});}catch(e){this.localNotice.set('Rohdatenexport nicht möglich: '+String(e));}}
  async importBackup(){if(this.localBusy())return;this.localBusy.set(true);try{const config=await importLocal(JSON.parse(this.importText));this.backupSources=JSON.stringify(config,null,2);await this.restore();this.localNotice.set('Sicherung lokal zusammengeführt. Bestehende Quellen bleiben erhalten. Sicherungsquellen können separat in das Konfigurationsfeld übernommen werden.');}catch(e){this.localNotice.set('Import abgelehnt: '+String(e));}finally{this.localBusy.set(false);}}
  useBackupSources(){this.configText=this.backupSources;this.configNotice.set('Quellen aus Sicherung zur Prüfung übernommen. Zum Aktivieren bewusst lokal speichern.');}
  state(id:string){return status(id,this.progress());}
  label(id:string){return {passed:'Bestanden',available:'Verfügbar',locked:'Gesperrt'}[this.state(id)];}
  select(id:string){this.selected.set(trainings.find(t=>t.id===id)!);this.answers.set(this.sessions()[id]?.answers || []);this.notice.set('');this.article.set('');this.articleError.set('');this.currentPath.set('');this.loading.set(false);this.request++;if(this.view()==='learn' || this.view()==='assess')this.loadIfIdle();}
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
  readMarker(path:string):ReadMarker|undefined {
    const source=this.sourceState('content');if(source.state!=='ready')return;
    const material=this.files().find(f=>f.path===path);
    return {trainingId:this.selected().id as TrainingId,source:source.provenance,materialId:material?.id || 'linked-material',path};
  }
  isRead(path:string){const marker=this.readMarker(path);return !!marker && this.progress().read.includes(readIdentity(marker));}
  async markRead(){const marker=this.readMarker(this.currentPath());if(!this.article() || !marker || this.isRead(marker.path) || !this.localReady())return;
    if(!this.pendingRead().some(x=>readIdentity(x)===readIdentity(marker)))this.pendingRead.update(rows=>[...rows,marker]);await this.savePending();
  }
  reset(){this.sessions.update(s=>Object.fromEntries(Object.entries(s).filter(([,a])=>!!this.pending()[a.id])));this.answers.set([]);this.notice.set('Offene Sitzungsversuche verworfen. Gespeicherte Historie und ausstehende Speicherungen bleiben erhalten.');}
}
