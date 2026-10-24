import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import { quizzes, grade, result } from './quiz';
import { trainings } from './catalog';
import { normalize, status, decide, prerequisites, type Progress } from './progress';
interface Material {path:string; title:string; kind:string;}
@Component({selector:'app-root',standalone:true,imports:[FormsModule],templateUrl:'./app.html'})
export class App {
  readonly trainings=trainings;
  readonly nav=[{id:'tree',icon:'⌘',label:'Skill Tree'},{id:'learn',icon:'▤',label:'Learning Workspace'},{id:'assess',icon:'◇',label:'Assessment Center'},{id:'skills',icon:'◉',label:'Competency Dashboard'},{id:'admin',icon:'⊞',label:'Training Administration'}];
  view=signal('tree'); selected=signal(trainings[0]); filter=signal('all'); query=signal('');
  progress=signal<Progress>(this.restore()); notice=signal(''); storageWarning=signal('');
  materials=signal<Record<string,Material[]>>({}); article=signal(''); currentPath=signal(''); loading=signal(false);
  checks=[false,false,false]; request=0;
  answers=signal<number[]>([]);
  quiz=computed(()=>quizzes[this.selected().id]);
  quizResult=computed(()=>result(this.selected().id,this.progress().quizzes[this.selected().id]));
  answered=computed(()=>this.quiz().questions.filter((_,i)=>Number.isInteger(this.answers()[i])).length);
  answer(index:number, value:number){this.answers.update(a=>{const next=[...a];next[index]=value;return next;});}
  evaluateQuiz(){
    const id=this.selected().id;
    if(this.state(id)==='locked' || this.quizResult())return;
    const score=grade(id,this.answers());
    if(!score){this.notice.set('Bitte beantworte zuerst alle Fragen.');return;}
    this.persist({...this.progress(),quizzes:{...this.progress().quizzes,[id]:{version:this.quiz().version,answers:[...this.answers()]}}});
    this.notice.set('');
  }
  retryQuiz(){
    if(this.state(this.selected().id)!=='available')return;
    const attempts={...this.progress().quizzes};delete attempts[this.selected().id];
    this.persist({...this.progress(),quizzes:attempts});this.answers.set([]);this.notice.set('');
  }
  quizAnswers(){return this.progress().quizzes[this.selected().id]?.answers || this.answers();}
  visible=computed(()=>trainings.filter(t=>(this.filter()==='all'||this.state(t.id)===this.filter()) && `${t.id} ${t.title} ${t.skills.join(' ')}`.toLowerCase().includes(this.query().toLowerCase())));
  files=computed(()=>this.materials()[this.selected().id]||[]);
  constructor(){fetch('materials/index.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(x=>this.materials.set(x)).catch(()=>this.notice.set('Lernmaterialien konnten nicht geladen werden. Bitte neu laden.'));}
  restore(){try{return normalize(JSON.parse(localStorage.getItem('ai-training-demo-v1')||'null'));}catch{return normalize(null);}}
  persist(p:Progress){this.progress.set(p);try{localStorage.setItem('ai-training-demo-v1',JSON.stringify(p));}catch{this.storageWarning.set('Browser-Speicher nicht verfügbar. Fortschritt gilt nur für diese Sitzung.');}}
  state(id:string){return status(id,this.progress());}
  prerequisiteLabel(id:string){const required=prerequisites[id]||[];return required.length?required.map(x=>this.trainings.find(t=>t.id===x)?.title||x).join(' und ')+' bestanden':'Software-Engineering-Grundlagen';}
  prerequisiteCodes(id:string){return (prerequisites[id]||[]).join(', ') || 'keine';}
  label(id:string){return {passed:'Bestanden',available:'Verfügbar',locked:'Gesperrt'}[this.state(id)];}
  select(id:string){this.selected.set(trainings.find(t=>t.id===id)!);this.checks=[false,false,false];this.answers.set([]);this.notice.set('');this.article.set('');this.currentPath.set('');this.request++;}
  navigate(view:string){this.view.set(view);this.notice.set('');}
  learn(){if(this.state(this.selected().id)==='locked')return;this.view.set('learn');const f=this.files()[0];if(f)void this.open(f);}
  async open(file:Material){
    const token=++this.request;this.currentPath.set(file.path);this.loading.set(true);this.article.set('');
    try{const r=await fetch(`materials/${file.path}`);if(!r.ok)throw Error();let html=await marked.parse(await r.text());
      // Repository-relative resources stay inside the mirrored materials directory.
      const base=new URL(`materials/${file.path}`,document.baseURI);
      const doc=new DOMParser().parseFromString(html,'text/html');
      doc.querySelectorAll('a[href],img[src]').forEach(el=>{const attr=el.tagName==='A'?'href':'src';const href=el.getAttribute(attr)!;if(!/^(?:[a-z]+:|#|\/)/i.test(href))el.setAttribute(attr,new URL(href,base).href);if(el.tagName==='A'&&!href.startsWith('#')){el.setAttribute('target','_blank');el.setAttribute('rel','noopener noreferrer');}});
      if(token===this.request)this.article.set(doc.body.innerHTML);
    }catch{if(token===this.request)this.article.set('<p>Material konnte nicht geladen werden. Bitte erneut auswählen.</p>');}
    finally{if(token===this.request)this.loading.set(false);}
  }
  markRead(){const path=this.currentPath();if(path&&!this.progress().read.includes(path))this.persist({...this.progress(),read:[...this.progress().read,path]});}
  submit(){const p=decide(this.selected().id,this.progress(),this.checks);if(p===this.progress()){this.notice.set('Für die Demo-Freigabe muss der Wissenstest bestanden sein und alle drei simulierten Nachweise müssen bestätigt sein.');return;}this.persist(p);this.notice.set(`${this.selected().id}: Demo-Gate bestanden. Das nächste Training ist jetzt verfügbar.`);}
  reset(){this.persist(normalize(null));this.select('M01');this.checks=[false,false,false];this.notice.set('Demo-Fortschritt zurückgesetzt.');}
}
