import {useState, useEffect, type FormEvent} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Link} from 'react-router-dom';
import {handleResponse} from '../api/auth';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordField from '../components/auth/PasswordField';
const API_URL = import.meta.env.VITE_API_URL;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState('');
  const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  const status = useQuery({queryKey: ['recovery-status'], queryFn: async () => handleResponse<{available: boolean}>(await fetch(`${API_URL}/auth/recovery-status`)), retry: false});
  async function submit(event: FormEvent) {event.preventDefault(); setError(''); setPending(true);
    try {const result = await handleResponse<{message: string}>(await fetch(`${API_URL}/auth/forgot-password`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email: email.trim()})})); setMessage(result.message);}
    catch (err) {setError(err instanceof Error ? err.message : 'Could not request reset');} finally {setPending(false);}}
  return <AuthLayout title="Forgot your password?" description="Request a single-use link to set a new password.">
    {status.isPending ? <p role="status" className="mt-5 text-sm">Checking recovery availability…</p> : !status.data?.available ? <p role="status" className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Email recovery is currently unavailable. The site owner needs to configure email delivery before reset links can be sent.</p> : message ? <p role="status" className="mt-5 rounded-lg bg-indigo-50 p-4 text-sm">{message}</p> : <form className="mt-6 space-y-5" onSubmit={submit}><label htmlFor="email" className="block text-sm font-medium">Account email<input type="email" id="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-2.5" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={pending} className="w-full rounded-lg bg-indigo-700 p-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Requesting link…' : 'Send reset link'}</button></form>}
    <Link to="/login" className="mt-5 inline-block text-sm text-indigo-700 underline">Back to sign in</Link></AuthLayout>;
}

export function ResetPasswordPage() {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('token') || '');
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [pending, setPending] = useState(false);
  useEffect(() => {if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);}, []);
  async function submit(event: FormEvent) {event.preventDefault(); setError(''); if (password !== confirm) {setError('Passwords do not match.'); return;} setPending(true);
    try {const result = await handleResponse<{message: string}>(await fetch(`${API_URL}/auth/reset-password`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({token, password})})); setMessage(result.message); setPassword(''); setConfirm('');}
    catch (err) {setError(err instanceof Error ? err.message : 'Could not reset password');} finally {setPending(false);}}
  return <AuthLayout title="Set a new password" description="Reset links expire after 15 minutes. Changing your password signs out existing sessions.">
    {message ? <p role="status" className="mt-5 rounded-lg bg-indigo-50 p-4 text-sm">{message}</p> : !token ? <p role="alert" className="mt-5 text-sm text-red-700">This link is missing its reset token. <Link className="underline" to="/forgot-password">Request a new link.</Link></p> : <form onSubmit={submit} className="mt-6 space-y-5"><PasswordField value={password} onChange={setPassword} newPassword /><label className="block text-sm font-medium" htmlFor="confirm-password">Confirm new password<input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="mt-2 w-full rounded-lg border border-gray-300 p-2.5" /></label>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={pending} className="w-full rounded-lg bg-indigo-700 p-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Updating…' : 'Update password'}</button></form>}
    <Link to="/login" className="mt-5 inline-block text-sm text-indigo-700 underline">Back to sign in</Link></AuthLayout>;
}
