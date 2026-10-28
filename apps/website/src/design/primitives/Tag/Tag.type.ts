/* @layer website-site @kind types */
import type { HTMLAttributes, ReactNode } from 'react';

type TagVariant = 'normal' | 'urgency';
type TagColor = 'neutral' | 'warning' | 'accent';

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: TagVariant;
  color?: TagColor;
  icon?: ReactNode;
  children?: ReactNode;
};

export type { TagProps };
