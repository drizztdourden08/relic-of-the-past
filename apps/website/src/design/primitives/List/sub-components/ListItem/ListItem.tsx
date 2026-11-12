/* @layer website-site @kind component */
import { Box } from '../../../Box';
import type { ListItemProps } from '../../List.type';
import './ListItem.css';

const ListItem = ({ bare = false, className, children, ...rest }: ListItemProps) => (
  <Box as="li" className={`ds-list-item${bare ? ' ds-list-item--bare' : ''}${className ? ` ${className}` : ''}`} {...rest}>
    {children}
  </Box>
);

export { ListItem };
