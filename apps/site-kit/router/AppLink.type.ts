/* @layer site-kit @kind types */
import type { LinkProps } from '@drizztdourden08/tessera/primitives';

type AppLinkProps = Omit<LinkProps, 'href' | 'navigate' | 'external'> & {
  to: string;
};

export type { AppLinkProps };
