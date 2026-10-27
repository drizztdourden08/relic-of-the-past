/* @layer website-site @kind types */
type ScrollRailMark = {
  id: string;
  label: string;
  name: string;
};

type ScrollRailProps = {
  marks: readonly ScrollRailMark[];
  rangeId: string;
  activeId: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
  thumbLabel: string;
  className?: string;
};

type RailGeometry = {
  top: number;
  span: number;
  fractions: readonly number[];
};

export type { RailGeometry, ScrollRailMark, ScrollRailProps };
