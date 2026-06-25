import { useQuery } from "@tanstack/react-query";
import { getHealth } from "../api/health";

export default function HomePage() {
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
    </main>
  );
}
