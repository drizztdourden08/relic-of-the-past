/* @layer site-kit @kind component */
/**
 * An in-site link: a real anchor (middle click and copy link keep working) whose plain
 * left click goes through the history router instead of a full reload.
 */
import type { CSSProperties, MouseEvent, ReactNode } from 'react';
import { Box } from '@ds/primitives/Box';
import { navigate } from './useLocation';

type LinkProps = {
  to: string;
  className?: string;
  /** Custom properties for the link's own styles, such as an item's colour. */
  style?: CSSProperties;
  children?: ReactNode;
  'aria-current'?: 'page';
};

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
export type { LinkProps };
