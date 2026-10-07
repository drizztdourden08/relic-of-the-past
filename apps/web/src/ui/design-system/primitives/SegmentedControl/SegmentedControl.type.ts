/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { ControlSize } from '../control-size';

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
  /**
   * Control density. Defaults to `md`, which is the tier this control draws today.
   * `sm` also closes the 16px gap between the label and the track, which is
   * 8% of the inspector rail's 188px content floor spent on nothing.
   */
  size?: ControlSize;
}

export type {
  SegmentOption,
  SegmentedControlProps,
};
