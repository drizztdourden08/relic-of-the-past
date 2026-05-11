import type { ReactNode } from 'react';
import './Overlay.css';

interface OverlayProps {
  visible: boolean;
  children: ReactNode;
}

export function Overlay({ visible, children }: OverlayProps): JSX.Element | null {
  if (!visible) return null;
  return <div className="overlay">{children}</div>;
}
