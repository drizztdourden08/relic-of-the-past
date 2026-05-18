import type { ReactNode } from 'react';
import './Overlay.css';

export interface OverlayProps {
  visible: boolean;
  children: ReactNode;
}

export const Overlay = (props: OverlayProps) => {
  const { visible, children } = props;

  if (!visible) return null;
  return <div className="overlay">{children}</div>;
};
