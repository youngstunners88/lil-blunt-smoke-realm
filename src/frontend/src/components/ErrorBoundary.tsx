import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Lil Blunt: The Smoke Realm failed to render", error, info);
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <div
        role="alert"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground"
      >
        <p className="font-display text-xl">
          Something went wrong loading Lil Blunt: The Smoke Realm.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg border border-current px-4 py-2 font-mono text-xs uppercase tracking-[0.2em]"
        >
          Reload
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
