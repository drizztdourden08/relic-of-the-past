/* @layer renderer-components @kind component */
/**
 * A render fence: whatever its subtree throws is caught here and shown as an
 * inline notice in the subtree's place, so one broken section never unmounts
 * the page around it. A class because React hands render errors only to
 * class components (getDerivedStateFromError); nothing else in the design
 * system needs one. A changed `resetKey` drops the error and tries again.
 */
import { Component } from 'react';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import type { ErrorInfo, ReactNode } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.type';
import './ErrorBoundary.css';

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { caught: false, error: undefined };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { caught: true, error };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(previous: ErrorBoundaryProps): void {
    if (this.state.caught && previous.resetKey !== this.props.resetKey) {
      this.setState({ caught: false, error: undefined });
    }
  }

  render(): ReactNode {
    const { caught, error } = this.state;
    const { children, label = 'This section could not be shown', action, className = '' } = this.props;
    if (!caught) return children;
    return (
      <Box role="alert" className={`error-boundary${className ? ` ${className}` : ''}`}>
        <Text className="error-boundary__label">{label}</Text>
        <Text className="error-boundary__detail">{messageOf(error)}</Text>
        {action != null && <Box className="error-boundary__action">{action}</Box>}
      </Box>
    );
  }
}

export { ErrorBoundary };
