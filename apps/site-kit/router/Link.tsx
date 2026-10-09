/* @layer site-kit @kind component */
import type { MouseEvent } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { navigate } from './useLocation';
import type { LinkProps } from './Link.type';

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const Link = (props: LinkProps) => {
  const { to, className, children, ...rest } = props;
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    navigate(to);
  };
  return (
    <Box as="a" href={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </Box>
  );
};

export { Link };
export type { LinkProps } from './Link.type';
