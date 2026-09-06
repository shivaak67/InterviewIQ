import {useState, type FormEvent} from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import {useAuth} from '../contexts/useAuth';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordField from '../components/auth/PasswordField';
export default function LoginPage() {
  const {login} = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') || '/dashboard';
  const destination = /^\/dashboard(?:\/|\?|$)/.test(next) && !next.includes('\\') ? next : '/dashboard';
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {event.preventDefault(); setError(''); setPending(true); try {await login(email, password); navigate(destination, {replace: true});} catch (err) {setError(err instanceof Error ? err.message : 'Sign-in failed');} finally {setPending(false);}}
  return <AuthLayout title="Welcome back" description="Sign in to continue your interview practice."><form onSubmit={submit} className="mt-6 space-y-5"><label className="block text-sm font-medium" htmlFor="email">Email<input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-2.5" /></label><PasswordField value={password} onChange={setPassword} />
    <Link to="/forgot-password" className="block text-right text-xs font-medium text-indigo-700 underline">Forgot password?</Link>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={pending} className="w-full rounded-lg bg-indigo-700 p-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Signing in…' : 'Sign in'}</button></form><p className="mt-5 text-sm text-gray-600">New to Prep Pilot? <Link to="/register" className="font-medium text-indigo-700 underline">Create an account</Link></p></AuthLayout>;
}
