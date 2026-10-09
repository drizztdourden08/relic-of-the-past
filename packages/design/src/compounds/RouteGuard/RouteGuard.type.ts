/* @layer site-kit @kind types */
import type { ComponentType, ReactNode } from 'react';
import type { RouteEntry } from '../../router/route-table.type';

type FrameProps = { bare?: boolean; children: ReactNode };

type RouteGuardProps = {
  routes: readonly RouteEntry[];
  homePath: string;
  signIn: (returnTo: string | undefined) => ReactNode;
  pending: ReactNode;
  frame: ComponentType<FrameProps>;
  siteName: string;
};

export type { RouteGuardProps, FrameProps };
