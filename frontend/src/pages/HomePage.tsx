import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getHealth } from "../api/health";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">InterviewIQ</h1>
      <p className="mt-2 text-gray-600">AI-powered interview preparation</p>
      <p className="mt-4 text-sm">
        API status:{" "}
        {isLoading && <span className="text-gray-500">checking...</span>}
        {isError && <span className="text-red-600">unreachable</span>}
        {!isLoading && !isError && data && (
          <span className="text-green-600">{data.status}</span>
        )}
      </p>
      <div className="mt-6 flex gap-4 text-sm">
        {user ? (
          <Link to="/dashboard" className="font-medium underline">
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link to="/login" className="font-medium underline">
              Login
            </Link>
            <Link to="/register" className="font-medium underline">
              Register
            </Link>
          </>
        )}
      </div>
    </main>
  );
}