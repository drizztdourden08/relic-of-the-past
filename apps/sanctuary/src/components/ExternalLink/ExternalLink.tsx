/* @layer sanctuary-site @kind component */
/** An anchor to another site (a GitHub issue), opened in a new tab without a referrer. */
import type { HTMLAttributes, ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';

type ExternalLinkProps = HTMLAttributes<HTMLElement> & {
  href: string;
  children?: ReactNode;
};

/** Spread, not written as attributes: the Box primitive types anchor attributes loosely. */
const NEW_TAB = { target: '_blank', rel: 'noreferrer' };

const ExternalLink = (props: ExternalLinkProps) => {
  const { href, children, ...rest } = props;
  return (
    <Box as="a" href={href} {...NEW_TAB} {...rest}>
      {children}
    </Box>
  );
};

export { ExternalLink };
export type { ExternalLinkProps };
