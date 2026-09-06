import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteJobDescription, fetchJobDescriptions, updateJobDescription } from "../../api/jobDescriptions";
import type { JobDescription } from "../../types/jobDescription";

function JobCard({job}: {job: JobDescription}) {
  const client = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(job.parsed_json?.title || job.raw_text.slice(0, 80));
  const [technologies, setTechnologies] = useState(job.parsed_json?.technologies.join(", ") || "");
  const [required, setRequired] = useState(job.parsed_json?.required_skills?.join(", ") || "");
  const [preferred, setPreferred] = useState(job.parsed_json?.preferred_skills?.join(", ") || "");
  const refresh = () => {
    client.invalidateQueries({queryKey: ["job-descriptions"]});
    client.invalidateQueries({queryKey: ["interview-sessions"]});
    client.invalidateQueries({queryKey: ["interview-session"]});
  };
  const split = (text: string) => [...new Set(text.split(",").map(item => item.trim()).filter(Boolean))];
  const save = useMutation({mutationFn: () => updateJobDescription(job.id, {title, technologies: split(technologies), required_skills: split(required), preferred_skills: split(preferred)}), onSuccess: () => {setEditing(false); refresh();}});
  const remove = useMutation({mutationFn: () => deleteJobDescription(job.id), onSuccess: refresh});
  return <li className="rounded-xl border border-gray-200 bg-white p-5">
    <h3 className="font-semibold">{job.parsed_json?.title || job.raw_text.slice(0, 80)}</h3>
    <p className="mt-1 text-xs text-gray-500">Saved {new Date(job.created_at).toLocaleDateString()}</p>
    {editing ? <form className="mt-4 space-y-3" onSubmit={e => {e.preventDefault(); save.mutate();}}>
      {[{label: "Company and role", value: title, set: setTitle}, {label: "Technologies (comma separated)", value: technologies, set: setTechnologies}, {label: "Required skills (comma separated)", value: required, set: setRequired}, {label: "Preferred skills (comma separated)", value: preferred, set: setPreferred}].map(field => <label className="block text-sm" key={field.label}>{field.label}<input className="mt-1 w-full rounded border border-gray-300 p-2" value={field.value} maxLength={field.label === "Company and role" ? 160 : 2000} onChange={e => field.set(e.target.value)} /></label>)}
      <button disabled={save.isPending} className="rounded bg-black px-4 py-2 text-sm text-white">{save.isPending ? "Saving…" : "Save corrections"}</button>
      <button type="button" onClick={() => setEditing(false)} className="ml-3 text-sm underline">Cancel</button>
    </form> : <>
      <div className="mt-3 flex flex-wrap gap-2">{job.parsed_json?.technologies.map(item => <span key={item} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs text-indigo-900">{item}</span>)}</div>
      <p className="mt-3 text-xs text-gray-500">Extracted automatically. Review and correct before practicing.</p>
      <details className="mt-4 text-sm"><summary className="cursor-pointer font-medium">Requirements and full posting</summary>
        <p className="mt-3"><strong>Required:</strong> {job.parsed_json?.required_skills?.join(", ") || "Not explicitly identified"}</p>
        <p className="mt-2"><strong>Preferred:</strong> {job.parsed_json?.preferred_skills?.join(", ") || "Not explicitly identified"}</p>
        {(job.parsed_json?.responsibilities.length ?? 0) > 0 && <ul className="mt-3 list-disc space-y-1 pl-5">{job.parsed_json?.responsibilities.map(item => <li key={item}>{item}</li>)}</ul>}
        <p className="mt-4 whitespace-pre-wrap text-gray-600">{job.raw_text}</p>
      </details>
      <button className="mt-4 text-sm font-medium text-indigo-700 underline" onClick={() => setEditing(true)}>Edit name and skills</button>
      <button disabled={remove.isPending} className="ml-4 text-sm text-red-700" onClick={() => {if (window.confirm("Remove this job description? Delete linked interview sessions first. This cannot be undone.")) remove.mutate();}}>Remove</button>
    </>}
    {(save.error || remove.error) && <p role="alert" className="mt-3 text-sm text-red-700">{save.error?.message || remove.error?.message}</p>}
  </li>;
}

export default function JobDescriptionList() {
  const {data, isLoading, isError} = useQuery({queryKey: ["job-descriptions"], queryFn: fetchJobDescriptions});
  return <section className="mt-8 rounded-xl border border-gray-200 p-6"><h2 className="text-lg font-semibold">Saved roles</h2>
    {isLoading && <p className="mt-4">Loading roles…</p>}
    {isError && <p role="alert" className="mt-4 text-red-700">Could not load roles. Please refresh.</p>}
    {data?.length === 0 && <p className="mt-4 text-gray-600">Save a job posting to focus your practice.</p>}
    <ul className="mt-4 space-y-4">{data?.map(job => <JobCard key={job.id} job={job} />)}</ul>
  </section>;
}
