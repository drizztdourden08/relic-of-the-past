/* @layer renderer-components @kind component */
import { Box } from '../../primitives/Box';
import { Button } from '../../primitives/Button';
import './NavRail.css';
import { type NavRailProps } from './NavRail.type';

/**
 * Vertical icon + label nav rail (the Profile Hub / Data Manager side menus).
 * Active = gold (primary), hover = green (secondary). Labels collapse to
 * icon-only when the rail is narrow (container query).
 */
const NavRail = (props: NavRailProps) => {
  const { items, activeId, onSelect, className = '' } = props;
  return (
    <Box as="nav" className={`nav-rail${className ? ` ${className}` : ''}`}>
      {items.map((item) => (
        <Button
          variant="bare"
          key={item.id}
          className={`nav-rail__item${item.id === activeId ? ' nav-rail__item--active' : ''}`}
          onClick={() => onSelect(item.id)}
          title={typeof item.label === 'string' ? item.label : undefined}
        >
          {item.icon != null && <Box as="span" className="nav-rail__icon">{item.icon}</Box>}
          <Box as="span" className="nav-rail__label">{item.label}</Box>
        </Button>
      ))}
    </Box>
  );
};

export { NavRail };
