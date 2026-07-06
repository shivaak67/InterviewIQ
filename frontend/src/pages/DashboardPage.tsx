import { Link } from "react-router-dom";
import JobDescriptionForm from "../components/job-description/JobDescriptionForm";
import JobDescriptionList from "../components/job-description/JobDescriptionList";
import ResumeList from "../components/resume/ResumeList";
import ResumeUpload from "../components/resume/ResumeUpload";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          type="button"
          onClick={logout}
          className="rounded border border-gray-300 px-4 py-2 text-sm"
        >
          Logout
        </button>
      </div>
      <p className="mt-4 text-gray-600">
        Welcome, <span className="font-medium text-black">{user?.email}</span>
      </p>

      <ResumeUpload />
      <ResumeList />
      <JobDescriptionForm />
      <JobDescriptionList />

      <Link to="/" className="mt-8 inline-block text-sm underline">
        Back to home
      </Link>
    </main>
  );
}
