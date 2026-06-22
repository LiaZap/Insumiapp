import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    return { hasError: true, message: msg };
  }

  override componentDidCatch(error: unknown, info: unknown) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-danger/60" aria-hidden />
          <div>
            <p className="text-base font-semibold text-ink-900">Algo deu errado</p>
            <p className="mt-1 text-sm text-ink-500">{this.state.message}</p>
          </div>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-600 transition hover:bg-brand-100"
          >
            <RefreshCw size={14} aria-hidden />
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
