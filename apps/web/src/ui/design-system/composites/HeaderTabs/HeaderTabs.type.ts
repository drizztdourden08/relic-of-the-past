/* @layer renderer-components @kind types */

/** One pill of the strip: a scroll target or a view, with an optional count after the label. */
interface HeaderTabItem {
  id: string;
  label: string;
  badge?: string | number;
}

interface HeaderTabsProps {
  items: readonly HeaderTabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  ariaLabel: string;
  className?: string;
}

export type { HeaderTabItem, HeaderTabsProps };
