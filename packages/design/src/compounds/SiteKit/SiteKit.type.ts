/* @layer site-kit @kind types */
import type { ReactNode } from 'react';
import type { SiteDefinition } from '../../site/site-definition.type';

type SiteKitProps = {
  site: SiteDefinition;
  children: ReactNode;
};

export type { SiteKitProps };
