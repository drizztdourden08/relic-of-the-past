/* @layer renderer-components @kind util */
import { Icon, Span } from '@drizztdourden08/tessera/primitives';
import type { ReactElement } from 'react';
import type { IconifyIcon } from '@iconify/types';

const menuIcon = (source: IconifyIcon | string): ReactElement =>
  (typeof source === 'string' ? <Span aria-hidden>{source}</Span> : <Icon icon={source} size={16} aria-hidden />);

export { menuIcon };
