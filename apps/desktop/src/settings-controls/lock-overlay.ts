/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { LockOverlayProps } from '@drizztdourden08/brock-react';
import { LockOverlayView } from './LockOverlayView';

const lockOverlay = (props: LockOverlayProps): ReactNode => createElement(LockOverlayView, props);

export { lockOverlay };
