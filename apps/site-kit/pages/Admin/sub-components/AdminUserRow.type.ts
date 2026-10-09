/* @layer site-kit @kind types */
import type { ReactNode } from 'react';
import type { AdminUser, GroupView } from '@rotp/hub-client';

type AdminUserRowProps = {
  row: AdminUser;
  groups: readonly GroupView[];
  action?: ReactNode;
};

export type { AdminUserRowProps };
