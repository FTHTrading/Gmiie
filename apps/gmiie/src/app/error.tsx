"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-headline font-serif font-bold text-text-primary mb-3">
        Something went wrong
      </h1>
      <p className="text-body text-text-muted mb-6 max-w-md">
        An unexpected error occurred while loading this page.
        This is usually temporary — please try again.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 text-label font-mono font-semibold uppercase tracking-wider bg-gold/10 text-gold border border-gold/20 rounded-lg hover:bg-gold/20 transition-colors"
      >
        Try Again
      </button>
      {process.env.NODE_ENV === "development" && error?.message && (
        <pre className="mt-6 p-4 bg-surface border border-border-subtle rounded-lg text-caption text-left max-w-2xl overflow-auto">
          {error.message}
        </pre>
      )}
    </div>
  );
}
