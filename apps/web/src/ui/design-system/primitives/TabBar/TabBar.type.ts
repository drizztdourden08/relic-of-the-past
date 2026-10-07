/* @layer renderer-components @kind types */
﻿interface TabItem {
  id: string;
  label: string;
  icon?: string;
  /** A count shown beside the label. Omit it for a tab with nothing to tally. */
  badge?: string | number;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /** Drops the visible label, keeping it as the button's native `title` tooltip instead. */
  iconOnly?: boolean;
}

export type {
  TabItem,
  TabBarProps,
};
