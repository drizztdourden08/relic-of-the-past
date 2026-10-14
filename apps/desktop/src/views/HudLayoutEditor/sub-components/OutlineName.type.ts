/* @layer renderer-components @kind types */
interface OutlineNameProps {
  kind: 'container' | 'element';
  label: string;
  cell?: string;
  locked?: string;
  missingSlots: readonly number[];
  selected: boolean;
  onSelect: () => void;
}

export type { OutlineNameProps };
