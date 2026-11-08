import React from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

/**
 * Reusable Page-Level Error Boundary:
 * Catches runtime React render crashes and failed lazy chunk loads.
 * Keeps Header and Sidebar alive and displays a short, token-themed error card.
 * Automatically resets when the activeTab key changes on remount.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoToDashboard = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onNavigateToDashboard) {
      this.props.onNavigateToDashboard();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div id="page-error-boundary-container" className="flex items-center justify-center p-4 sm:p-6 min-h-[460px] w-full">
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 max-w-[calc(100vw-32px)] sm:max-w-md w-full text-center shadow-lg space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="py-1">
              <p className="text-sm font-semibold text-text">This page couldn't load.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                id="error-boundary-retry-btn"
                onClick={this.handleRetry}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-0 h-11 sm:h-9 px-4 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>

              <button
                type="button"
                id="error-boundary-dashboard-btn"
                onClick={this.handleGoToDashboard}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-0 h-11 sm:h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
