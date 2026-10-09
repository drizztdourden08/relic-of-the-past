/* @layer store-site @kind types */
import type { ReactNode } from 'react';
import type { IconifyIcon } from '@iconify/react/offline';
import type { SettingsPageTabs } from '@drizztdourden08/tessera/composites';

type TitledPageProps = {
  icon: IconifyIcon;
  title: string;
  tabs?: SettingsPageTabs;
  scroll?: boolean;
  actions?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
};

export type { TitledPageProps };
