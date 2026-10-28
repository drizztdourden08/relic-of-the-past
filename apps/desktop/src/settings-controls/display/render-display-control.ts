/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { AspectRatioInput } from './AspectRatioInput';
import { VsyncToggle } from './VsyncToggle';
import type { ControlContext } from '../settings-controls.type';

const renderDisplayControl = (key: string, ctx: ControlContext): ReactNode | null => {
  switch (key) {
    case 'aspectRatio': return createElement(AspectRatioInput, ctx);
    case 'vsync': return createElement(VsyncToggle, ctx);
    default: return null;
  }
};

export { renderDisplayControl };
