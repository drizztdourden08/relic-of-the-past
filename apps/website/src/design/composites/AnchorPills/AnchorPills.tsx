/* @layer website-site @kind component */
import { Box } from '../../primitives/Box';
import { Pressable } from '../../primitives/Pressable';
import { useRevealActive } from './behavior/useRevealActive';
import type { AnchorPillsProps } from './AnchorPills.type';
import './AnchorPills.css';

const AnchorPills = ({ items, activeId, onSelect, ariaLabel, className, wrap = false }: AnchorPillsProps) => {
  const trackRef = useRevealActive(activeId);
  const classes = ['ds-pills', wrap ? 'ds-pills--wrap' : '', className ?? ''].filter(Boolean).join(' ');

  return (
    <Box as="nav" className={classes} aria-label={ariaLabel}>
      <Box as="ul" ref={trackRef} className="ds-pills__track">
        {items.map((item) => (
          <Box as="li" key={item.id}>
            <Pressable className="ds-pills__item" aria-current={item.id === activeId ? 'location' : undefined} onClick={() => onSelect(item.id)}>
              {item.label}
            </Pressable>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { AnchorPills };
