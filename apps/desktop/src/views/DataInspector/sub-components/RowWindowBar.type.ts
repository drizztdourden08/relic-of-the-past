/* @layer renderer-app @kind types */
interface RowWindowBarProps {
  shown: number;
  total: number;
  onShowMore: () => void;
  onShowAll: () => void;
}

export type { RowWindowBarProps };
