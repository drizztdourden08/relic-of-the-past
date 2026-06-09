/* @layer renderer-components @kind component */
import { useState, useMemo } from 'react';
import { Box } from '../../primitives/Box';
import { Text } from '../../primitives/Text';
import { TextInput } from '../../primitives/TextInput';
import type { SideNavProps } from './SideNav.type';
import './SideNav.css';

/** Searchable, grouped left navigation. Active item is gold. */
const SideNav = (props: SideNavProps) => {
  const { groups, activeId, onSelect, searchable = false, searchPlaceholder = 'Filter…', header } = props;
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return groups;
    return groups
      .map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q)) }))
      .filter(g => g.items.length > 0);
  }, [groups, q]);

  return (
    <Box as="nav" className="side-nav">
      {header && <Box className="side-nav__header">{header}</Box>}
      {searchable && (
        <Box className="side-nav__search">
          <TextInput value={query} onChange={e => setQuery(e.target.value)} placeholder={searchPlaceholder} />
        </Box>
      )}
      <Box className="side-nav__list">
        {filtered.map((group, gi) => (
          <Box key={group.title ?? gi} className="side-nav__group">
            {group.title && <Text className="side-nav__group-title">{group.title}</Text>}
            {group.items.map(item => (
              <Box
                as="button"
                key={item.id}
                className={`side-nav__item${item.id === activeId ? ' side-nav__item--active' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                {item.icon && <Box as="span" className="side-nav__icon">{item.icon}</Box>}
                {item.label}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { SideNav };
