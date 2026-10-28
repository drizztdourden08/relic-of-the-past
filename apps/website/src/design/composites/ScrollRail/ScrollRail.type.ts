/* @layer website-site @kind types */
import type { ReactNode } from 'react';

type ScrollRailMark = {
  id: string;
  label: string;
  name: string;
};

type ScrollRailEnd = {
  name: string;
  icon: ReactNode;
  onSelect: () => void;
};

type ScrollRailProps = {
  marks: readonly ScrollRailMark[];
  rangeId: string;
  activeId: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
  thumbLabel: string;
  end?: ScrollRailEnd;
  className?: string;
};

type RailGeometry = {
  top: number;
  span: number;
  fractions: readonly number[];
};

export type { RailGeometry, ScrollRailMark, ScrollRailProps };
