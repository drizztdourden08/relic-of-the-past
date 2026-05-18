import type { ReactNode } from 'react';
import './Overlay.css';
import { type OverlayProps } from './types';


const Overlay = (props: OverlayProps) => {
  const { visible, children } = props;

  if (!visible) return null;
  return <div className="overlay">{children}</div>;
};

export {
  Overlay,
};
