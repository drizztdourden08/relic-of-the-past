/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { AspectRatioRow } from './AspectRatioRow';
import { VsyncRow } from './VsyncRow';
import type { ControlContext } from '../settings-controls.type';

const renderDisplayControl = (key: string, ctx: ControlContext): ReactNode | null => {
  switch (key) {
    case 'aspectRatio': return createElement(AspectRatioRow, ctx);
    case 'vsync': return createElement(VsyncRow, ctx);
    default: return null;
  }
};

export { renderDisplayControl };
