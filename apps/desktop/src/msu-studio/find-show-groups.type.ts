/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';

type FindShowGroupsProps = {
  t: I18n['t'];
  tabs: ReactNode;
  find: { value: string; onChange: (value: string) => void; placeholder: string; ariaLabel: string };
  show: { count: number; checked: boolean; onChange: (checked: boolean) => void; label: string };
};

export type { FindShowGroupsProps };
