import {useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {fetchAttempts, saveDraft, submitAttempt} from '../../api/practice';
import type {GeneratedQuestion} from '../../types/interview';

export default function PracticePanel({question}: {question: GeneratedQuestion}) {
  const client = useQueryClient();
  const [answer, setAnswer] = useState(question.draft_text || '');
  const [savedText, setSavedText] = useState(question.draft_text || '');
  const [bookmarked, setBookmarked] = useState(question.bookmarked || false);
  const [followUpFrom, setFollowUpFrom] = useState<number | undefined>(question.draft_follow_up_from ?? undefined);
  const [notice, setNotice] = useState('');
  const attempts = useQuery({queryKey: ['practice-attempts', question.id], queryFn: () => fetchAttempts(question.id), retry: 1});
  const latest = attempts.data?.at(-1);
  const followUp = attempts.data?.find(a => a.id === followUpFrom);
  const refresh = () => {
    client.invalidateQueries({queryKey: ['interview-session', question.session_id]});
    client.invalidateQueries({queryKey: ['interview-sessions']});
  };
  const save = useMutation({mutationFn: () => saveDraft(question.id, answer, bookmarked, followUpFrom), onSuccess: () => {setSavedText(answer); setNotice('Draft and bookmark saved.'); refresh();}});
  const submit = useMutation({mutationFn: async () => {
    await saveDraft(question.id, answer, bookmarked, followUpFrom);
    return submitAttempt(question.id, answer.trim(), followUpFrom);
  }, onSuccess: (attempt) => {
    client.setQueryData(['practice-attempts', question.id], [...(attempts.data || []), attempt]);
    setSavedText(answer); setNotice('Feedback saved. Revise your answer and try again.'); refresh();
  }});
  const pending = submit.isPending || save.isPending;
  return <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-gray-900">Your practice answer</h3>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={bookmarked} onChange={e => {setBookmarked(e.target.checked); setNotice('Save draft to keep your bookmark.');}} disabled={pending} />Bookmark for review</label></div>
    <p className="mt-2 text-sm text-gray-600">Try the question before opening the guidance. Use real examples and explain your reasoning.</p>
    {followUp && <div className="mt-3 rounded-lg bg-white p-3"><p className="text-xs font-semibold text-indigo-700">FOLLOW-UP PRACTICE</p><p className="mt-1 text-sm">{followUp.feedback_json.follow_up}</p>
      <button type="button" className="mt-2 text-xs underline" disabled={pending} onClick={() => setFollowUpFrom(undefined)}>Return to original question</button></div>}
    <label htmlFor={`answer-${question.id}`} className="mt-4 block text-sm font-medium">{followUp ? 'Your follow-up answer' : 'Your answer'}</label>
    <textarea id={`answer-${question.id}`} value={answer} onChange={e => {setAnswer(e.target.value); setNotice('');}} disabled={pending} rows={7} maxLength={12000} placeholder="Start with your approach, explain your decisions, and finish with the outcome or tradeoff…" className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm leading-6 focus:border-indigo-500" />
    <p className="mt-1 text-xs text-gray-500">{answer.length}/12,000 characters · {answer === savedText ? 'No unsaved text changes' : 'Unsaved changes — save before leaving this page'}</p>
    <div className="mt-4 flex flex-wrap gap-3">
      <button className="rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50" disabled={pending || answer.trim().length < 20 || attempts.isError || attempts.isLoading} onClick={() => submit.mutate()}>{submit.isPending ? 'Reviewing your answer…' : latest ? 'Submit another attempt' : 'Get feedback'}</button>
      <button className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm disabled:opacity-50" disabled={pending} onClick={() => save.mutate()}>{save.isPending ? 'Saving…' : 'Save draft'}</button>
      <button className="text-sm underline" onClick={async () => {try {await navigator.clipboard.writeText(answer); setNotice('Answer copied.');} catch {setNotice('Copy unavailable. Select the answer text and copy it.');}}}>Copy answer</button>
    </div>
    <p role="status" className="mt-2 text-xs text-indigo-800">{notice}</p>
    {submit.isPending && <p role="status" className="mt-2 text-xs text-gray-600">Checking relevance, evidence, structure, and depth. This can take up to a minute.</p>}
    {(submit.error || save.error || attempts.error) && <p role="alert" className="mt-3 text-sm text-red-700">{submit.error?.message || save.error?.message || 'Practice history is unavailable. Please refresh before submitting.'}</p>}
    {latest && <section className="mt-5 border-t border-indigo-100 pt-5" aria-label="Latest answer feedback">
      <h4 className="font-semibold">Feedback on attempt {attempts.data?.length}</h4>
      <p className="mt-1 text-xs text-gray-500">AI coaching estimates, not a hiring prediction. Compare scores only for the same question.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries({Relevance: latest.feedback_json.relevance, Specificity: latest.feedback_json.specificity, Structure: latest.feedback_json.structure, Depth: latest.feedback_json.technical_depth}).map(([label, score]) => <div className="rounded-lg bg-white p-3" key={label}><p className="text-xs text-gray-500">{label}</p><p className="text-lg font-semibold">{score}<span className="text-xs font-normal text-gray-500"> / 5</span></p></div>)}</div>
      <h5 className="mt-4 text-sm font-semibold">What worked</h5><ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{latest.feedback_json.strengths.map(text => <li key={text}>{text}</li>)}</ul>
      <h5 className="mt-4 text-sm font-semibold">What to improve</h5><ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{latest.feedback_json.improvements.map(text => <li key={text}>{text}</li>)}</ul>
      <p className="mt-4 rounded-lg bg-white p-3 text-sm"><strong>Next attempt: </strong>{latest.feedback_json.next_step}</p>
      <p className="mt-4 text-sm"><strong>Interviewer follow-up: </strong>{latest.feedback_json.follow_up}</p>
      <button className="mt-2 text-sm font-medium text-indigo-700 underline" disabled={pending} onClick={() => {setFollowUpFrom(latest.id); setNotice('Your existing answer remains above. Replace it with your follow-up response; submitted attempts stay in history.'); document.getElementById(`answer-${question.id}`)?.focus();}}>Practice this follow-up</button>
      <details className="mt-4"><summary className="cursor-pointer text-sm font-medium">Attempt history ({attempts.data?.length})</summary><ol className="mt-3 space-y-3">{attempts.data?.map((attempt, index) => <li key={attempt.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm"><strong>Attempt {index + 1}</strong><p className="mt-1 text-xs text-gray-500">{new Date(attempt.created_at).toLocaleString()}</p><p className="mt-2 font-medium">{attempt.prompt_text}</p><p className="mt-2 whitespace-pre-wrap">{attempt.answer_text}</p><p className="mt-2 text-indigo-800">{attempt.feedback_json.next_step}</p></li>)}</ol></details>
    </section>}
  </div>;
}
