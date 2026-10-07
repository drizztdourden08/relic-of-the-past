/* @layer renderer-components @kind component */
/** One nav entry: gold icon, then (when the nav is open) its label and a chevron. */
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Icon } from '../../../primitives/Icon';
import { CHEVRON_RIGHT, GLYPH_BOX } from '../SectionNav.constants';
import type { SectionNavItem as Item } from '../SectionNav.type';
import './SectionNavItem.css';

interface SectionNavItemProps {
  item: Item;
  active: boolean;
  onSelect: (id: string) => void;
}

const SectionNavItem = (props: SectionNavItemProps) => {
  const { item, active, onSelect } = props;
  return (
    <Button
      variant="bare"
      className={`section-nav__item${active ? ' section-nav__item--active' : ''}`}
      onClick={() => onSelect(item.id)}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
    >
      <Box as="span" className="section-nav__icon" aria-hidden="true">{item.icon}</Box>
      <Box as="span" className="section-nav__label">{item.label}</Box>
      <Icon className="section-nav__chevron" paths={[CHEVRON_RIGHT]} viewBox={GLYPH_BOX} size={16} aria-hidden="true" />
    </Button>
  );
};

export { SectionNavItem };
