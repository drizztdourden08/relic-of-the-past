/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { AspectRatioRow } from './AspectRatioRow';
import { CascadeToggle } from './CascadeToggle';
import { SyncedRateRow } from './SyncedRateRow';
import { TargetRateRow } from './TargetRateRow';
import { VsyncRow } from './VsyncRow';
import { CASCADE_KEYS } from './display.constants';
import type { ControlContext } from '../settings-controls.type';
import type { CascadeKey } from './display.type';

const renderDisplayControl = (key: string, ctx: ControlContext): ReactNode | null => {
  if (CASCADE_KEYS.has(key)) return createElement(CascadeToggle, { settingKey: key as CascadeKey, ...ctx });
  switch (key) {
    case 'aspectRatio': return createElement(AspectRatioRow, ctx);
    case 'vsync': return createElement(VsyncRow, ctx);
    case 'syncedRefreshRate': return createElement(SyncedRateRow, ctx);
    case 'syncedRefreshRateHz': return createElement(TargetRateRow, ctx);
    default: return null;
  }
};

export { renderDisplayControl };
