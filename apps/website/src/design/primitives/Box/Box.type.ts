/* @layer website-site @kind types */
import type { ElementType, HTMLAttributes, ReactNode, Ref } from 'react';

type BoxProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  ref?: Ref<HTMLElement>;
  children?: ReactNode;
};

export type { BoxProps };
