/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

interface OptionValueTagProps {
  value: boolean | string | number;
  label?: ReactNode;
  compact?: boolean;
  className?: string;
}

interface LabelledValue {
  value: string;
  label: string;
}

interface LabelledGroup {
  options: readonly LabelledValue[];
}

export type { LabelledGroup, LabelledValue, OptionValueTagProps };
