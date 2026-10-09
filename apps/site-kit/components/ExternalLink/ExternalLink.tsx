/* @layer site-kit @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { NEW_TAB } from './ExternalLink.constants';
import type { ExternalLinkProps } from './ExternalLink.type';

const ExternalLink = (props: ExternalLinkProps) => {
  const { href, children, ...rest } = props;
  return (
    <Box as="a" href={href} {...NEW_TAB} {...rest}>
      {children}
    </Box>
  );
};

export { ExternalLink };
export type { ExternalLinkProps } from './ExternalLink.type';
