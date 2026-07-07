import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function LandingNavbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-lg font-bold tracking-tight">
          Prep Pilot
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded bg-black px-4 py-2 text-white transition hover:bg-gray-800"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded border border-gray-300 px-4 py-2 transition hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded bg-black px-4 py-2 text-white transition hover:bg-gray-800"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
