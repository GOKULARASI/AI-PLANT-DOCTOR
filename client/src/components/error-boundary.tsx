import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[40vh] w-full text-center gap-4 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
          <ShieldAlert className="w-12 h-12 text-rose-500/80" />
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {this.props.fallbackMessage || 'Something went wrong.'}
          </h2>
          <p className="text-sm px-4 py-2 rounded-lg bg-rose-500/10 text-rose-600 font-mono text-left max-w-2xl overflow-auto w-full">
            {this.state.error?.message || 'Unknown error occurred during rendering.'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 mt-2 rounded-xl text-sm font-bold border transition-colors hover:bg-black/5"
            style={{ color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
