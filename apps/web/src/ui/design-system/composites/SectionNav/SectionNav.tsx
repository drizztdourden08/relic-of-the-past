/* @layer renderer-components @kind component */
/**
 * The side nav shared by the profile window, the Data manager and the Data
 * inspector. One panel of gold line icons, collapsed by default; the round
 * chevron on its edge opens it to show group labels and item labels. The
 * search mark sits above Home and opening the nav grows the field around it.
 * On narrow screens the open panel floats over the content, so the page never
 * reflows.
 */
import { useState } from 'react';
import { Box } from '../../primitives/Box';
import { Button } from '../../primitives/Button';
import { Icon } from '../../primitives/Icon';
import { Text } from '../../primitives/Text';
import { CHEVRON_RIGHT, GLYPH_BOX } from './SectionNav.constants';
import { SectionNavItem } from './sub-components/SectionNavItem';
import { SectionNavSearch } from './sub-components/SectionNavSearch';
import type { SectionNavProps } from './SectionNav.type';
import './SectionNav.css';

const SectionNav = (props: SectionNavProps) => {
  const { config, activeId, onSelect, search, defaultOpen = false, className = '' } = props;
  const [open, setOpen] = useState(defaultOpen);
  const showTop = config.home !== undefined || search !== undefined;

  return (
    <Box as="nav" className={`section-nav${open ? ' section-nav--open' : ''}${className ? ` ${className}` : ''}`} aria-label="Sections">
      <Box className="section-nav__panel">
        <Button
          variant="bare"
          className="section-nav__toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Collapse navigation' : 'Expand navigation'}
        >
          <Icon paths={[CHEVRON_RIGHT]} viewBox={GLYPH_BOX} size={14} />
        </Button>

        {showTop && (
          <Box className="section-nav__top">
            {search && <SectionNavSearch search={search} open={open} onOpen={() => setOpen(true)} />}
            {search && config.home && <Box className="section-nav__split" aria-hidden="true" />}
            {config.home && (
              <SectionNavItem item={config.home} active={config.home.id === activeId} onSelect={onSelect} />
            )}
          </Box>
        )}

        <Box className="section-nav__groups">
          {config.groups.map((group) => (
            <Box key={group.id} className="section-nav__group" role="group" aria-label={group.label}>
              <Text as="span" className="section-nav__group-label">{group.label}</Text>
              {group.items.map((item) => (
                <SectionNavItem key={item.id} item={item} active={item.id === activeId} onSelect={onSelect} />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export { SectionNav };
