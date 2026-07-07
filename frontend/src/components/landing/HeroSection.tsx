import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-24">
      <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
        AI interview prep
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Practice interviews tailored to your resume and target role
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
        Upload your resume, paste a job description, and get personalized
        questions with model answers so you walk in prepared.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        {user ? (
          <Link
            to="/dashboard"
            className="rounded bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/register"
              className="rounded bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Create free account
            </Link>
            <Link
              to="/login"
              className="rounded border border-gray-300 bg-white px-6 py-3 text-sm font-medium transition hover:bg-gray-50"
            >
              Sign in
            </Link>
          </>
        )}
      </div>
      </div>
    </section>
  );
}
