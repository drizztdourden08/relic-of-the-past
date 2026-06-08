/* @layer renderer-components @kind types */
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type TextVariant = 'body' | 'label' | 'title' | 'subtitle' | 'caption';

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: TextVariant;
  children?: ReactNode;
}

export type { TextProps, TextVariant };
