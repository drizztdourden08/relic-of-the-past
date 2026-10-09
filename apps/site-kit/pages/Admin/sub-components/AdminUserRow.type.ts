/* @layer site-kit @kind types */
import type { ReactNode } from 'react';
import type { AdminUser, GroupView } from '../../../api/hub-responses.type';

type AdminUserRowProps = {
  row: AdminUser;
  groups: readonly GroupView[];
  action?: ReactNode;
};

export type { AdminUserRowProps };
