/* @layer website-site @kind types */
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type TextTone = 'dim' | 'muted' | 'primary' | 'secondary';

type TextProps = HTMLAttributes<HTMLElement> & {
  tone?: TextTone;
  children?: ReactNode;
};

type TextElementProps = TextProps & {
  as: ElementType;
};

export type { TextElementProps, TextProps, TextTone };
