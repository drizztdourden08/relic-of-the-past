/* @layer renderer-components @kind types */
interface StateListProps {
  selected: number;
  onSelect: (action: number) => void;
  fill?: boolean;
}

export type { StateListProps };
