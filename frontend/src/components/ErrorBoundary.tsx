// src/components/ErrorBoundary.tsx
import React from 'react';

type State = { hasError: boolean; error?: Error; info?: React.ErrorInfo };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught', error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2 style={{ color: '#7b1fa2' }}>Something went wrong</h2>
          <pre style={{ background: '#fff0f6', padding: 12, borderRadius: 8 }}>
            {String(this.state.error)}
            {this.state.info?.componentStack && '\n\n' + this.state.info?.componentStack}
          </pre>
          <button onClick={() => location.reload()}>Reload</button>
        </div>
      );
    }
    return (this.props.children ?? null) as React.ReactElement | null;
  }
}
