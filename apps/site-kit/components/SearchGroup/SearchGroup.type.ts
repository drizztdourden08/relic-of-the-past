/* @layer site-kit @kind types */
import type { ReactNode } from 'react';
import type { IconifyIcon as IconData } from '@iconify/react/offline';

type SearchGroupProps = {
  label: string;
  icon: IconData;
  count: number;
  onOpen: () => void;
  children: ReactNode;
};

export type { SearchGroupProps };
