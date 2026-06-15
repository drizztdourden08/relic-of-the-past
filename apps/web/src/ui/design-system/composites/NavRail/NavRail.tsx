/* @layer renderer-components @kind component */
import { Box } from '../../primitives/Box';
import { Button } from '../../primitives/Button';
import './NavRail.css';
import { useNavRailCollapse } from './behavior/useNavRailCollapse';
import { type NavRailProps } from './NavRail.type';

/**
 * Vertical icon + label nav rail (the Profile Hub / Data Manager side menus).
 * Active = gold (primary), hover = green (secondary). Always scrollable. On
 * narrow viewports it collapses to icons with an unfold button that floats the
 * labeled menu over content (see useNavRailCollapse).
 */
const NavRail = (props: NavRailProps) => {
  const { items, activeId, onSelect, className = '' } = props;
  const { expanded, toggle, collapse } = useNavRailCollapse();

  const handleSelect = (id: string) => {
    onSelect(id);
    collapse();
  };

  return (
    <Box as="nav" className={`nav-rail${expanded ? ' nav-rail--expanded' : ''}${className ? ` ${className}` : ''}`}>
      <Button variant="bare" className="nav-rail__unfold" onClick={toggle} title="Menu" aria-label="Toggle menu">
        ☰
      </Button>
      <Box className="nav-rail__panel">
        {items.map((item) => (
          <Button
            variant="bare"
            key={item.id}
            className={`nav-rail__item${item.id === activeId ? ' nav-rail__item--active' : ''}`}
            onClick={() => handleSelect(item.id)}
            title={typeof item.label === 'string' ? item.label : undefined}
          >
            {item.icon != null && <Box as="span" className="nav-rail__icon">{item.icon}</Box>}
            <Box as="span" className="nav-rail__label">{item.label}</Box>
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export { NavRail };
