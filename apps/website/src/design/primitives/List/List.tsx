/* @layer website-site @kind component */
import { Box } from '../Box';
import type { ListProps } from './List.type';
import './List.css';

const List = ({ ordered = false, className, children, ...rest }: ListProps) => (
  <Box as={ordered ? 'ol' : 'ul'} className={`ds-list ds-list--${ordered ? 'numbers' : 'bullets'}${className ? ` ${className}` : ''}`} {...rest}>
    {children}
  </Box>
);

export { List };
