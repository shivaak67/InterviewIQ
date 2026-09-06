import {Link} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import InterviewGenerator from '../components/interview/InterviewGenerator';
import InterviewSessionList from '../components/interview/InterviewSessionList';
import JobDescriptionForm from '../components/job-description/JobDescriptionForm';
import JobDescriptionList from '../components/job-description/JobDescriptionList';
import ResumeList from '../components/resume/ResumeList';
import ResumeUpload from '../components/resume/ResumeUpload';
import {fetchInterviewSessions} from '../api/interviews';
import {useAuth} from '../contexts/useAuth';

export default function DashboardPage() {
  const {logout} = useAuth();
  const sessions = useQuery({queryKey: ['interview-sessions'], queryFn: fetchInterviewSessions});
  const latest = sessions.data?.[0];
  const practiced = sessions.data?.reduce((total, session) => total + (session.practiced_count || 0), 0) || 0;
  const attempts = sessions.data?.reduce((total, session) => total + (session.attempt_count || 0), 0) || 0;
  const recommendation = sessions.data?.find(session => session.next_step)?.next_step;
  return <div className="min-h-screen bg-slate-50">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
      <Link className="flex items-center gap-3 text-lg font-bold tracking-tight" to="/"><span className="flex size-9 items-center justify-center rounded-xl bg-indigo-700 text-sm text-white">PP</span>Prep Pilot</Link>
      <nav aria-label="Dashboard navigation" className="flex items-center gap-5 text-sm"><a className="font-semibold text-indigo-700" href="#practice">Practice</a><a href="#materials" className="text-gray-600">Materials</a><button onClick={logout} className="rounded-lg border border-gray-200 px-3 py-2 text-gray-600">Sign out</button></nav>
    </div></header>
    <main className="mx-auto max-w-6xl px-5 py-9 sm:px-8" id="practice">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700">Your interview workspace</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">A little practice. A clearer answer.</h1>
      <p className="mt-3 max-w-2xl text-gray-600">Work through real questions, sharpen your reasoning, and build on each attempt.</p>
      <div className="mt-7 grid grid-cols-3 gap-3 sm:gap-5">{[{label: 'Practice sessions', value: sessions.data?.length || 0}, {label: 'Questions practiced', value: practiced}, {label: 'Answer attempts', value: attempts}].map(stat => <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5" key={stat.label}><p className="text-2xl font-bold tracking-tight">{sessions.isLoading ? '—' : sessions.isError ? '—' : stat.value}</p><p className="mt-1 text-xs text-gray-600 sm:text-sm">{stat.label}</p></div>)}</div>
      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-200">{latest ? 'Pick up where you left off' : 'Your next step'}</p>
            <h2 className="mt-4 text-xl font-semibold leading-snug">{latest ? latest.job_description_preview : 'Build your first practice session'}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{latest ? `${latest.practiced_count || 0} of ${latest.question_count} questions practiced. Your saved answers and feedback are ready when you are.` : 'Bring a resume and a role you are excited about. We will help you turn your experience into a focused practice session.'}</p>
            {latest ? <Link className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900" to={`/dashboard/sessions/${latest.id}`}>Continue practice →</Link> : <a className="mt-6 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900" href="#materials">Add practice materials →</a>}
          </section>
          <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-5"><h2 className="text-sm font-semibold text-indigo-950">Focus for your next attempt</h2><p className="mt-2 text-sm leading-6 text-indigo-900">{recommendation || 'Choose one question. Explain your approach, name a tradeoff, and give a concrete example before opening the guidance.'}</p></section>
        </div>
        <InterviewGenerator />
      </div>
      <div className="mt-8"><InterviewSessionList /></div>
      <section id="materials" className="mt-14 scroll-mt-6 border-t border-gray-200 pt-8"><p className="text-xs font-semibold uppercase tracking-widest text-indigo-700">Your preparation library</p><h2 className="mt-2 text-2xl font-bold tracking-tight">Practice materials</h2><p className="mt-2 text-sm text-gray-600">Keep your resume current and give each target role a recognizable name.</p>
        <div className="grid items-start gap-6 lg:grid-cols-2"><div><ResumeUpload /><ResumeList /></div><div><JobDescriptionForm /><JobDescriptionList /></div></div>
      </section>
      <footer className="mt-10 border-t border-gray-200 pt-6 text-xs text-gray-500">Prep Pilot · Built for thoughtful practice. <Link to="/privacy" className="ml-3 underline">Your data</Link></footer>
    </main>
  </div>;
}
