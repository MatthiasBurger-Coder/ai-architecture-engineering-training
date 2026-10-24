import M01 from '../../../modules/M01-llm-foundations/assessment/quiz.json' with { type: 'json' };
import M09 from '../../../modules/M09-model-training-finetuning/assessment/quiz.json' with { type: 'json' };
import M02 from '../../../modules/M02-tool-calling/assessment/quiz.json' with { type: 'json' };
import M03 from '../../../modules/M03-mcp-engineering/assessment/quiz.json' with { type: 'json' };
import M04 from '../../../modules/M04-rag-retrieval/assessment/quiz.json' with { type: 'json' };
import M05 from '../../../modules/M05-context-engineering/assessment/quiz.json' with { type: 'json' };
import M06 from '../../../modules/M06-agentic-patterns/assessment/quiz.json' with { type: 'json' };
import M07 from '../../../modules/M07-evaluation-observability/assessment/quiz.json' with { type: 'json' };
import M08 from '../../../modules/M08-security-governance/assessment/quiz.json' with { type: 'json' };
import CAP from '../../../capstone/assessment/quiz.json' with { type: 'json' };

export interface Question { prompt: string; options: string[]; correct: number; explanation: string; }
export interface Quiz { version: number; questions: Question[]; }
export interface Attempt { version: number; answers: number[]; }
// The module-owned JSON files are the single source of assessment content.
export const quizzes: Record<string, Quiz> = { M01, M09, M02, M03, M04, M05, M06, M07, M08, CAP };
export function grade(id: string, answers: readonly number[]) {
  const quiz=quizzes[id];
  if(!quiz || answers.length!==quiz.questions.length || !quiz.questions.every((q,i)=>Number.isInteger(answers[i]) && answers[i]>=0 && answers[i]<q.options.length)) return null;
  const correct=quiz.questions.filter((q,i)=>q.correct===answers[i]).length;
  const required=Math.ceil(quiz.questions.length*0.75);
  return {correct, total:quiz.questions.length, required, passed:correct>=required};
}
export function result(id: string, attempt: Attempt | undefined) {
  return attempt && attempt.version===quizzes[id]?.version && Array.isArray(attempt.answers)?grade(id,attempt.answers):null;
}
