/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface SideNavItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface SideNavGroup {
  title?: string;
  items: SideNavItem[];
}

interface SideNavProps {
  groups: SideNavGroup[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Show a filter box that narrows items by label. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Optional content above the list (title, etc.). */
  header?: ReactNode;
  /**
   * Controlled search value. When provided, the parent owns the query (and is
   * responsible for filtering `groups`); SideNav stops filtering internally.
   * Omit for the uncontrolled mode where SideNav filters by item label itself.
   */
  query?: string;
  onQueryChange?: (value: string) => void;
}

export type { SideNavItem, SideNavGroup, SideNavProps };
