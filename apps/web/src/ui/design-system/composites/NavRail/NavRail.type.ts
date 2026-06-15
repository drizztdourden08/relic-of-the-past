/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface NavRailItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface NavRailProps {
  items: NavRailItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export type { NavRailItem, NavRailProps };
