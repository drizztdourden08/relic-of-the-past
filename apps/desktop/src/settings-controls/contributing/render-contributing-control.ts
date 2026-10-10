/* @layer renderer-app @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { SanctuaryAccount } from './SanctuaryAccount';

const renderContributingControl = (key: string): ReactNode | null =>
  (key === 'sanctuaryAccount' ? createElement(SanctuaryAccount) : null);

export { renderContributingControl };
