export default function LandingFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <p className="text-sm font-medium text-gray-900">Prep Pilot</p>
        <p className="mt-1 text-sm text-gray-600">
          AI-powered interview preparation for software engineers.
        </p>
        <p className="mt-4 text-xs text-gray-500">
          © {new Date().getFullYear()} Prep Pilot. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
