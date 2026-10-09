/* @layer site-kit @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import type { SearchGroupProps } from './SearchGroup.type';
import './SearchGroup.css';

const SearchGroup = (props: SearchGroupProps) => {
  const { label, icon, count, onOpen, children } = props;
  return (
    <Box as="section" className="search-group" aria-label={label}>
      <Box className="search-group__head">
        <Box as="span" className="search-group__icon" aria-hidden="true"><IconifyIcon icon={icon} /></Box>
        <Text as="h3" className="search-group__title">{label}</Text>
        <Text className="search-group__count">{count}</Text>
        <Button variant="bare" className="search-pill search-group__open" onClick={onOpen}>Open</Button>
      </Box>
      <Box className="search-group__table">{children}</Box>
    </Box>
  );
};

export { SearchGroup };
export type { SearchGroupProps } from './SearchGroup.type';
