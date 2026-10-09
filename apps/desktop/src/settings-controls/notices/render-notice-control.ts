/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { SanctuaryAccount } from '../contributing/SanctuaryAccount';
import { NOTICES } from './notices.constants';

const renderNoticeControl = (key: string): ReactNode | null => {
  if (key === 'sanctuaryAccount') return createElement(SanctuaryAccount);
  const notice = NOTICES[key];
  return notice === undefined ? null : createElement(EmptyState, { size: 'sm', message: notice });
};

export { renderNoticeControl };
