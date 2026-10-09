/* @layer renderer-app @kind logic */
import type { ReactNode } from 'react';
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { SanctuaryAccount } from '../contributing/SanctuaryAccount';
import { NOTICES } from './notices.constants';

const renderNoticeControl = (key: string): ReactNode | null => {
  if (key === 'sanctuaryAccount') return <SanctuaryAccount />;
  const notice = NOTICES[key];
  return notice === undefined ? null : <EmptyState size="sm" message={notice} />;
};

export { renderNoticeControl };
