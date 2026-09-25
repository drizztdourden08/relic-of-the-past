/* @layer renderer-components @kind types */
import type { ElementType, HTMLAttributes, ReactNode } from 'react';

/** The spacing scale, in full. `2xs` (2px) is the pairing step (a caption and
 *  the control it names reading as one thing) and the compact tier's row gap. */
type SpaceToken = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
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
