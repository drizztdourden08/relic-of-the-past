/* @layer renderer-components @kind logic */
import type { ControllerConnectionState } from '@drizztdourden08/brock-input';
import { CONNECTION_ICON, CONNECTION_LABEL } from '../ControllerStatusBar.constants';
import type { ConnectionLook } from './connection-look.type';
import { lookOf } from './look-of';

const linkLookOf = (connectionState?: ControllerConnectionState): ConnectionLook | null =>
  (connectionState ? lookOf(CONNECTION_ICON[connectionState], CONNECTION_LABEL[connectionState]) : null);

export { linkLookOf };
