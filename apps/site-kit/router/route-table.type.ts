/* @layer site-kit @kind types */
import type { ReactNode } from 'react';
import type { RouteParams } from '@rotp/hub-client';

type RouteAccess = 'public' | 'member' | 'admin';

type RouteEntry = {
  pattern: string;
  access: RouteAccess;
  render: (params: RouteParams) => ReactNode;
  bare?: boolean;
  permission?: string;
};

type ResolvedRoute = { entry: RouteEntry; params: RouteParams };

export type { RouteAccess, RouteEntry, ResolvedRoute };
