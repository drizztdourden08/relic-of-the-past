/* @layer renderer-components @kind types */
﻿import type { ReactNode } from 'react';

interface SegmentOption<T extends string = string> {
  value: T;
  /** Text, or an icon for a control too narrow to spell its options out. */
  label: ReactNode;
  /** Tooltip and accessible name, needed whenever the label is an icon. */
  title?: string;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string = string> {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  /**
   * Re-clicking the already-active segment normally does nothing beyond
   * calling onChange with the value it already holds. Passing this makes
   * that click clear the field instead: it fires ONLY on a re-click of the
   * active segment, in place of onChange. Omit it to keep every segment a
   * plain radio with no way to reach "unset".
   */
  onDeselect?: () => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export type {
  SegmentOption,
  SegmentedControlProps,
};
