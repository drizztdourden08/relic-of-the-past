/* @layer sanctuary-site @kind component */
/** One category of results: its icon, name and count, a way to open it, then its rows. */
import type { ReactNode } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import type { SearchCategory } from '../../search-categories';

type SearchGroupProps = {
  category: SearchCategory;
  count: number;
  onOpen: (category: SearchCategory) => void;
  children: ReactNode;
};

const SearchGroup = (props: SearchGroupProps) => {
  const { category, count, onOpen, children } = props;
  return (
    <Box as="section" className="site-search__group" aria-label={category.label}>
      <Box className="site-search__group-head">
        <Box as="span" className="site-search__group-icon" aria-hidden="true"><IconifyIcon icon={category.icon} /></Box>
        <Text as="h3" className="site-search__group-title">{category.label}</Text>
        <Text className="site-search__group-count">{count}</Text>
        <Button variant="bare" className="site-search__open" onClick={() => onOpen(category)}>Open</Button>
      </Box>
      <Box className="site-search__table">{children}</Box>
    </Box>
  );
};

export { SearchGroup };
export type { SearchGroupProps };
