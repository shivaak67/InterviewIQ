import {Link} from 'react-router-dom';
export default function NotFoundPage() {
  return <main className="mx-auto max-w-xl px-6 py-20"><p className="text-sm text-indigo-700">404</p><h1 className="mt-3 text-3xl font-bold">This page is not here.</h1><p className="mt-3 text-gray-600">The link may be out of date. Your saved practice is available from the dashboard.</p><Link to="/dashboard" className="mt-6 inline-block rounded-lg bg-indigo-700 px-5 py-3 text-sm font-semibold text-white">Go to dashboard</Link></main>;
}
