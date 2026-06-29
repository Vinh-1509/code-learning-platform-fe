import { Link } from '@tanstack/react-router';

export function RouteError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-xl font-bold text-foreground">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={reset}
            className="text-sm font-semibold text-primary underline underline-offset-4"
          >
            Try again
          </button>
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-muted-foreground underline underline-offset-4"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
