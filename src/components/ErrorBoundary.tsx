// @ts-nocheck
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 max-w-3xl w-full">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Something went wrong.</h1>
            <p className="text-slate-700 mb-6">A crash occurred in the React application.</p>
            <div className="bg-slate-100 p-4 rounded-xl overflow-auto text-sm font-mono text-slate-800 mb-4 whitespace-pre-wrap">
              {this.state.error?.toString()}
            </div>
            {this.state.errorInfo && (
              <div className="bg-slate-100 p-4 rounded-xl overflow-auto text-xs font-mono text-slate-600 whitespace-pre-wrap max-h-96">
                {this.state.errorInfo.componentStack}
              </div>
            )}
            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
