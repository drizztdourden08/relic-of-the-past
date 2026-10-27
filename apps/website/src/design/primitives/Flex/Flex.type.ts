/* @layer website-site @kind types */
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type FlexGap = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around';

type FlexProps = HTMLAttributes<HTMLElement> & {
  direction?: 'row' | 'column';
  gap?: FlexGap;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  as?: ElementType;
  children?: ReactNode;
};

export type { FlexAlign, FlexGap, FlexJustify, FlexProps };
