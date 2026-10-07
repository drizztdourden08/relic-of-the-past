/* @layer site-kit @kind component */
/** One group of search results: its icon, name and count, a way to open it, then its rows. */
import type { ReactNode } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import type { IconifyIcon as IconData } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import './SearchGroup.css';

type SearchGroupProps = {
  label: string;
  icon: IconData;
  count: number;
  onOpen: () => void;
  children: ReactNode;
};

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
export type { SearchGroupProps };
