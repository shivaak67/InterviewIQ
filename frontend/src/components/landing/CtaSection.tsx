import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function CtaSection() {
  const { user } = useAuth();

  return (
    <section className="border-t border-gray-200 bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-14 text-center sm:py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">Ready to practice?</h2>
        <p className="mx-auto mt-3 max-w-xl text-gray-300">
          Start with your resume and a job description, and build confidence before
          the real interview.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
            >
              Go to dashboard
            </Link>
          ) : (
            <Link
              to="/register"
              className="rounded bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-gray-100"
            >
              Create free account
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
