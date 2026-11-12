/* @layer website-site @kind types */
import type { HTMLAttributes, ReactNode } from 'react';
import type { TextTone } from '../Text';

type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

type TitleProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: TitleLevel;
  tone?: TextTone;
  children?: ReactNode;
};

export type { TitleProps };
