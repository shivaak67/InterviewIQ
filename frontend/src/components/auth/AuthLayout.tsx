import type {ReactNode} from 'react';
import {Link} from 'react-router-dom';
export default function AuthLayout({title, description, children}: {title: string; description: string; children: ReactNode}) {
  return <main className="flex min-h-screen flex-col items-center bg-slate-50 px-5 py-10 sm:py-16"><Link to="/" className="mb-8 flex items-center gap-3 text-xl font-bold"><span className="flex size-10 items-center justify-center rounded-xl bg-indigo-700 text-sm text-white">PP</span>Prep Pilot</Link><section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"><h1 className="text-2xl font-bold tracking-tight">{title}</h1><p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>{children}</section><Link className="mt-6 text-xs text-gray-500 underline" to="/">Back to home</Link></main>;
}
