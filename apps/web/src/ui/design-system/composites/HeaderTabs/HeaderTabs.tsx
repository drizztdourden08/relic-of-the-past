/* @layer renderer-components @kind component */
/**
 * The pill strip a page header carries beside its title: the sections to jump to, or
 * the views to switch between. The active pill is gold, and the strip wraps onto more
 * lines when the header is narrow.
 */
import { Box } from '../../primitives/Box';
import { Button } from '../../primitives/Button';
import type { HeaderTabsProps } from './HeaderTabs.type';
import './HeaderTabs.css';

const tabClass = (active: boolean): string =>
  `header-tabs__tab${active ? ' header-tabs__tab--active' : ''}`;

const HeaderTabs = (props: HeaderTabsProps) => {
  const { items, activeId, onSelect, ariaLabel, className = '' } = props;
  return (
    <Box as="nav" className={`header-tabs${className ? ` ${className}` : ''}`} aria-label={ariaLabel}>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <Button
            key={item.id}
            variant="bare"
            className={tabClass(active)}
            aria-current={active ? 'true' : undefined}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
            {item.badge != null && <Box as="span" className="header-tabs__badge">{item.badge}</Box>}
          </Button>
        );
      })}
    </Box>
  );
};

export { HeaderTabs };
