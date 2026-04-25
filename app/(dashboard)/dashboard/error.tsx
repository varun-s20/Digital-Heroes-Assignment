"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
      <div className="text-4xl">⚠️</div>
      <h2 className="text-xl font-fraunces font-bold">Something went wrong</h2>
      <p className="text-muted text-sm max-w-md">{error.message || "An unexpected error occurred loading this page."}</p>
      <button
        onClick={reset}
        className="mt-4 px-6 py-2 bg-accent text-black font-semibold rounded-lg hover:bg-accent/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
