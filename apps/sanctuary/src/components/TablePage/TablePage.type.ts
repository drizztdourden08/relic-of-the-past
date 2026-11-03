/* @layer sanctuary-site @kind types */
import type { ComponentProps, ReactNode } from 'react';
import type { SettingsPage } from '@drizztdourden08/tessera/composites';
import type { SurfaceFilterBar } from '@rotp/design';

type HeaderTabs = NonNullable<ComponentProps<typeof SettingsPage>['tabs']>;

type TablePageScope = {
  tabs: HeaderTabs['items'];
  activeId: HeaderTabs['activeId'];
  select: HeaderTabs['onSelect'];
};

type TablePageProps = {
  section: string;
  scope: TablePageScope;
  actions?: ReactNode;
  summary: ReactNode;
  error?: string | null;
  filter: ComponentProps<typeof SurfaceFilterBar>;
  table: ReactNode;
  aside?: ReactNode;
};

export type { TablePageProps };
