import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-6 sm:p-8 rounded-3xl bg-cream-50 border-2 border-red-500/30 text-center space-y-4 shadow-lg my-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 border border-red-300 text-red-700 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-heading font-bold text-red-950">
              {this.props.fallbackTitle || 'कुछ गड़बड़ हुई (An unexpected error occurred)'}
            </h3>
            <p className="text-xs text-muted font-body mt-1 max-w-md mx-auto">
              {this.state.error?.message ||
                this.props.fallbackMessage ||
                'लाइव प्रसारण या कैमरा लोड करने में समस्या आई। कृपया पुनः प्रयास करें।'}
            </p>
          </div>
          <div className="pt-2 flex justify-center">
            <Button
              variant="primary"
              size="sm"
              onClick={this.handleReset}
              className="bg-maroon-900 hover:bg-maroon-950 text-gold-200 flex items-center gap-2 font-bold"
            >
              <RefreshCw className="w-4 h-4" />
              <span>पुनः प्रयास करें (Try Again)</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
