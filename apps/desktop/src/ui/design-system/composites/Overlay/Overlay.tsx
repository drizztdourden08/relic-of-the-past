/* @layer renderer-components @kind component */
﻿import type { ReactNode } from 'react';
import './Overlay.css';
import { type OverlayProps } from './Overlay.type';


const Overlay = (props: OverlayProps) => {
  const { visible, children } = props;

  if (!visible) return null;
  return <div className="overlay">{children}</div>;
};

export {
  Overlay,
};
