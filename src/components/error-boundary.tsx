"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-4 text-center"
            style={{ background: "var(--bg-page)" }}
          >
            <div
              aria-hidden
              style={{
                color: "var(--text-muted)",
                fontSize: "1.25rem",
                lineHeight: 1,
              }}
            >
              —
            </div>
            <h2
              className="display-section"
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                color: "var(--text-primary)",
              }}
            >
              Something went wrong
            </h2>
            <p
              className="text-sm text-center"
              style={{ color: "var(--text-secondary)", maxWidth: 280 }}
            >
              An unexpected error occurred. Please refresh the page.
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
