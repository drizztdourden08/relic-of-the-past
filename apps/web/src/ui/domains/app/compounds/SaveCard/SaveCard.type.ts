/* @layer renderer-components @kind types */
import type { HTMLAttributes, ReactNode } from 'react';

type SaveCardVariant = 'row' | 'feature';

interface SaveCardProps extends HTMLAttributes<HTMLDivElement> {
  /** `row` = compact list item; `feature` = standalone bordered card. */
  variant?: SaveCardVariant;
  /** Dims + disables interaction while an operation is in flight. */
  busy?: boolean;
  /** Leading thumbnail slot (typically a `Thumbnail`). */
  thumb?: ReactNode;
  /** Trailing action slot (buttons). Omit to place actions inside children. */
  actions?: ReactNode;
}

export type { SaveCardVariant, SaveCardProps };
