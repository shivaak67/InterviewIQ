import {useState} from 'react';
export default function PasswordField({value, onChange, newPassword = false}: {value: string; onChange: (value: string) => void; newPassword?: boolean}) {
  const [visible, setVisible] = useState(false);
  return <div><label htmlFor="password" className="block text-sm font-medium">{newPassword ? 'New password' : 'Password'}</label>
    <div className="relative mt-2"><input id="password" type={visible ? 'text' : 'password'} required minLength={newPassword ? 8 : undefined} maxLength={newPassword ? 72 : undefined} autoComplete={newPassword ? 'new-password' : 'current-password'} value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 pl-3 pr-16" /><button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} className="absolute right-3 top-3 text-xs font-medium text-indigo-700" onClick={() => setVisible(!visible)}>{visible ? 'Hide' : 'Show'}</button></div>
    {newPassword && <p className="mt-1 text-xs text-gray-500">8–72 characters. Use a unique password.</p>}
  </div>;
}
