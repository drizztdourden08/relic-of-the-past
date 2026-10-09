/* @layer site-kit @kind types */
import type { ReactNode } from 'react';
import type { SettingsPageAnchor, SettingsPageTabs } from '@domains/app/compounds/SettingsPage';

type SitePageProps = {
  section: string;
  anchors?: SettingsPageAnchor[];
  tabs?: SettingsPageTabs;
  scroll?: boolean;
  actions?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
};

export type { SitePageProps };
