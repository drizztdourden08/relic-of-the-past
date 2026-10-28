/* @layer website-site @kind types */
import type { AnchorHTMLAttributes, ReactNode } from 'react';

type LinkTone = 'primary' | 'secondary';
type LinkVariant = 'inline' | 'subtle';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  tone?: LinkTone;
  variant?: LinkVariant;
  external?: boolean;
  children?: ReactNode;
};

export type { LinkProps };
