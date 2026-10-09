/* @layer site-kit @kind types */
import type { HTMLAttributes, ReactNode } from 'react';

type ExternalLinkProps = HTMLAttributes<HTMLElement> & {
  href: string;
  children?: ReactNode;
};

export type { ExternalLinkProps };
