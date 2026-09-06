import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {fetchJobDescriptions} from '../../api/jobDescriptions';
import {generateInterview} from '../../api/interviews';
import {fetchResumes} from '../../api/resumes';

export default function InterviewGenerator() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [resumeId, setResumeId] = useState('');
  const [jobId, setJobId] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [type, setType] = useState('mixed');
  const resumes = useQuery({queryKey: ['resumes'], queryFn: fetchResumes});
  const jobs = useQuery({queryKey: ['job-descriptions'], queryFn: fetchJobDescriptions});
  const selectedResume = resumeId || (resumes.data?.length === 1 ? String(resumes.data[0].id) : '');
  const selectedJob = jobId || (jobs.data?.length === 1 ? String(jobs.data[0].id) : '');
  const generate = useMutation({mutationFn: () => generateInterview(Number(selectedResume), Number(selectedJob), difficulty, type),
    onSuccess: session => {client.invalidateQueries({queryKey: ['interview-sessions']}); client.setQueryData(['interview-session', session.id], session); navigate(`/dashboard/sessions/${session.id}`);}});
  return <section className="rounded-xl border border-gray-200 bg-white p-6" id="new-practice">
    <h2 className="text-lg font-semibold">Start a new practice session</h2><p className="mt-1 text-sm text-gray-600">Choose your role, then focus on the interview you want to prepare for.</p>
    {resumes.isLoading || jobs.isLoading ? <p className="mt-4" role="status">Loading your materials…</p> : resumes.isError || jobs.isError ? <p role="alert" className="mt-4 text-red-700">Could not load practice materials. Please refresh.</p> : !resumes.data?.length || !jobs.data?.length ? <p className="mt-4 rounded-lg bg-indigo-50 p-4 text-sm text-indigo-900">Add a resume and a target role in <a href="#materials" className="font-medium underline">Practice materials</a> to begin.</p> : <form className="mt-5 space-y-4" onSubmit={e => {e.preventDefault(); generate.mutate();}}>
      <label className="block text-sm font-medium" htmlFor="resume-select">Resume<select required id="resume-select" value={selectedResume} disabled={generate.isPending} onChange={e => setResumeId(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"><option value="">Select a resume</option>{resumes.data.map(resume => <option value={resume.id} key={resume.id}>{resume.original_filename}</option>)}</select></label>
      <label className="block text-sm font-medium" htmlFor="job-select">Target role<select required id="job-select" value={selectedJob} disabled={generate.isPending} onChange={e => setJobId(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm"><option value="">Select a role</option>{jobs.data.map(job => <option value={job.id} key={job.id}>{job.parsed_json?.title || job.raw_text.slice(0, 80)}</option>)}</select></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium" htmlFor="difficulty">Difficulty<select id="difficulty" value={difficulty} disabled={generate.isPending} onChange={e => setDifficulty(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-2.5"><option value="beginner">Beginner / intern</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
      <label className="text-sm font-medium" htmlFor="interview-type">Interview focus<select id="interview-type" value={type} disabled={generate.isPending} onChange={e => setType(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-2.5"><option value="mixed">Balanced practice</option><option value="technical">Technical</option><option value="behavioral">Behavioral</option><option value="project_specific">Project deep dive</option><option value="system_design">System design</option></select></label></div>
      <button disabled={generate.isPending || !selectedResume || !selectedJob} className="w-full rounded-lg bg-indigo-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{generate.isPending ? 'Preparing your interview…' : 'Start practice →'}</button>
      {generate.isPending && <p role="status" className="text-sm text-gray-600">Building 8–10 questions from your experience and role. This can take up to a minute.</p>}
      {generate.error && <p role="alert" className="text-sm text-red-700">{generate.error.message}</p>}
    </form>}
  </section>;
}
