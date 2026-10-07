/* @layer renderer-components @kind types */
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type SpaceToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type FlexAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type FlexJustify = 'start' | 'center' | 'end' | 'between' | 'around';

interface FlexProps extends HTMLAttributes<HTMLElement> {
  direction?: 'row' | 'column';
  gap?: SpaceToken;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: boolean;
  inline?: boolean;
  /** Render as a different element (still a primitive; the raw element lives here). */
  as?: ElementType;
  children?: ReactNode;
}

export type { FlexProps, SpaceToken, FlexAlign, FlexJustify };
