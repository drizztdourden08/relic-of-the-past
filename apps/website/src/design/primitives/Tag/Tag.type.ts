/* @layer website-site @kind types */
import type { HTMLAttributes, ReactNode } from 'react';

type TagVariant = 'normal' | 'urgency';
type TagColor = 'neutral' | 'warning';

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: TagVariant;
  color?: TagColor;
  children?: ReactNode;
};

export type { TagColor, TagProps, TagVariant };
