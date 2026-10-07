/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { FlexJustify, SpaceToken } from '../Flex';

interface ButtonRowProps {
  /** Horizontal alignment of the buttons (default: end, footer style). */
  align?: FlexJustify;
  gap?: SpaceToken;
  className?: string;
  children: ReactNode;
}

export type { ButtonRowProps };
