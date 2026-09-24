/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface SectionNavItem {
  id: string;
  label: string;
  /** A line icon; it takes the nav's gold through `currentColor`. */
  icon: ReactNode;
}

interface SectionNavGroup {
  id: string;
  label: string;
  items: SectionNavItem[];
}

/** What a screen shows in its nav. The nav itself owns only its open/closed state. */
interface SectionNavConfig {
  /** Pinned above the groups, below the search row, in no group. */
  home?: SectionNavItem;
  groups: SectionNavGroup[];
}

/** A controlled search field; the host shows the results in its own pane. */
interface SectionNavSearch {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** The field gained or lost focus, so the host can enter or leave its search mode. */
  onFocusChange?: (focused: boolean) => void;
}

interface SectionNavProps {
  config: SectionNavConfig;
  activeId: string;
  onSelect: (id: string) => void;
  /** Omit to show no search field. */
  search?: SectionNavSearch;
  /** Collapsed to icons unless set. */
  defaultOpen?: boolean;
  className?: string;
}

export type { SectionNavConfig, SectionNavGroup, SectionNavItem, SectionNavProps, SectionNavSearch };
