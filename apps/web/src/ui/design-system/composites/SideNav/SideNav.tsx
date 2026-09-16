/* @layer renderer-components @kind component */
import { useState, useMemo } from 'react';
import { Box } from '../../primitives/Box';
import { Button } from '../../primitives/Button';
import { Text } from '../../primitives/Text';
import { TextInput } from '../../primitives/TextInput';
import type { SideNavGroup, SideNavProps } from './SideNav.type';
import './SideNav.css';

interface GroupTitleProps {
  group: SideNavGroup;
  activeId: string;
  onSelect: (id: string) => void;
}

/** A heading with an id is a target of its own; one without is a plain label. */
const GroupTitle = (props: GroupTitleProps) => {
  const { group, activeId, onSelect } = props;
  const { id, title } = group;
  if (id === undefined) return <Text className="side-nav__group-title">{title}</Text>;
  return (
    <Button
      variant="bare"
      className={`side-nav__group-title side-nav__group-title--action${id === activeId ? ' side-nav__group-title--active' : ''}`}
      onClick={() => onSelect(id)}
    >
      {title}
    </Button>
  );
};

/** Searchable, grouped left navigation. Active item is gold. */
const SideNav = (props: SideNavProps) => {
  const { groups, activeId, onSelect, searchable = false, searchPlaceholder = 'Filter...', header, query, onQueryChange } = props;
  const controlled = query !== undefined;
  const [innerQuery, setInnerQuery] = useState('');
  const value = controlled ? query : innerQuery;
  const q = value.trim().toLowerCase();

  // Controlled: the parent owns the query and pre-filters `groups`, so SideNav
  // must not filter again (the nav labels rarely contain the content query).
  const filtered = useMemo(() => {
    if (controlled || !q) return groups;
    return groups
      .map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q)) }))
      .filter(g => g.items.length > 0 || (g.id !== undefined && (g.title ?? '').toLowerCase().includes(q)));
  }, [controlled, groups, q]);

  const onInput = (next: string) => (controlled ? onQueryChange?.(next) : setInnerQuery(next));

  return (
    <Box as="nav" className="side-nav">
      {header && <Box className="side-nav__header">{header}</Box>}
      {searchable && (
        <Box className="side-nav__search">
          <TextInput value={value} onChange={e => onInput(e.target.value)} placeholder={searchPlaceholder} />
        </Box>
      )}
      <Box className="side-nav__list">
        {filtered.map((group, gi) => (
          <Box key={group.id ?? group.title ?? gi} className="side-nav__group">
            {group.title && <GroupTitle group={group} activeId={activeId} onSelect={onSelect} />}
            {group.items.map(item => (
              <Button
                variant="bare"
                key={item.id}
                className={`side-nav__item${item.id === activeId ? ' side-nav__item--active' : ''}`}
                onClick={() => onSelect(item.id)}
              >
                {item.icon && <Box as="span" className="side-nav__icon">{item.icon}</Box>}
                {item.label}
              </Button>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { SideNav };
