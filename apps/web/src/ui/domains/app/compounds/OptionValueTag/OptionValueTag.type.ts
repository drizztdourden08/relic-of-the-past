/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface OptionValueTagProps {
  /** A boolean reads True or False; anything else reads as its own text. */
  value: boolean | string | number;
  /** The control's own label, when it had one. */
  label?: ReactNode;
  /** The label at the small size, for a tag inside a small box. */
  compact?: boolean;
  className?: string;
}

/** One entry of a list a choice was picked from. */
interface LabelledValue {
  value: string;
  label: string;
}

export type { LabelledValue, OptionValueTagProps };
