/* @layer renderer-components @kind logic */
import type { IconifyIcon } from '@iconify/types';
import type { ConnectionLook } from './connection-look.type';

const lookOf = (icon: IconifyIcon | null, label: string | null): ConnectionLook | null =>
  (icon && label ? { icon, label, tone: 'success' } : null);

export { lookOf };
