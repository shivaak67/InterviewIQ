import { Link } from "react-router-dom";
import DashboardSection from "../components/dashboard/DashboardSection";
import InterviewGenerator from "../components/interview/InterviewGenerator";
import InterviewSessionList from "../components/interview/InterviewSessionList";
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
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back,{" "}
            <span className="font-medium text-black">{user?.email}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded border border-gray-300 px-4 py-2 text-sm"
        >
          Logout
        </button>
      </div>

      <DashboardSection
        title="Interview prep"
        description="Upload your resume and save job descriptions you'll practice against."
      >
        <ResumeUpload />
        <ResumeList />
        <JobDescriptionForm />
        <JobDescriptionList />
      </DashboardSection>

      <DashboardSection
        title="Your interviews"
        description="Generate personalized questions and track your answer progress."
      >
        <InterviewGenerator />
        <InterviewSessionList />
      </DashboardSection>

      <Link to="/" className="mt-10 inline-block text-sm underline">
        Back to home
      </Link>
    </main>
  );
}
