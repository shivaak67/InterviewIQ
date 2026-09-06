import {useState, type FormEvent} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/useAuth';
import AuthLayout from '../components/auth/AuthLayout';
import PasswordField from '../components/auth/PasswordField';
export default function RegisterPage() {
  const {register} = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [error, setError] = useState(''); const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {event.preventDefault(); setError(''); setPending(true); try {await register(email, password); navigate('/dashboard');} catch (err) {setError(err instanceof Error ? err.message : 'Registration failed');} finally {setPending(false);}}
  return <AuthLayout title="Make your next interview count" description="Create an account to save your materials, answers, and feedback."><form onSubmit={submit} className="mt-6 space-y-5"><label className="block text-sm font-medium" htmlFor="email">Email<input id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 p-2.5" /></label><PasswordField value={password} onChange={setPassword} newPassword />{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<button disabled={pending} className="w-full rounded-lg bg-indigo-700 p-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? 'Creating account…' : 'Create account'}</button></form><p className="mt-5 text-sm text-gray-600">Already have an account? <Link to="/login" className="font-medium text-indigo-700 underline">Sign in</Link></p></AuthLayout>;
}
