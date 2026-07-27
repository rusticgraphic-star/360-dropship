import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

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

  handleReset = () => {
    try {
      localStorage.removeItem('360_wholesale_products');
    } catch (e) {}
    window.location.hash = '';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold font-heading text-white">
                360 Dropship Network
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                App encountered a temporary display issue. Click below to reload cleanly.
              </p>

              {this.state.error && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-left font-mono text-[11px] overflow-x-auto max-h-48">
                  <p className="font-bold text-rose-200">{this.state.error.toString()}</p>
                  {this.state.error.stack && (
                    <pre className="text-[9px] text-rose-400 mt-1 whitespace-pre-wrap">
                      {this.state.error.stack.slice(0, 300)}
                    </pre>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Reload App Cleanly
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
