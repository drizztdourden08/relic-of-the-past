/* @layer renderer-components @kind component */
﻿import { Box } from '../../primitives/Box';
import './Overlay.css';
import { type OverlayProps } from './Overlay.type';

const Overlay = (props: OverlayProps) => {
  const { visible, children } = props;

  if (!visible) return null;
  return <Box className="overlay">{children}</Box>;
};

export {
  Overlay,
};
