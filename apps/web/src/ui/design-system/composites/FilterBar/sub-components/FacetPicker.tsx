/* @layer renderer-components @kind component */
/**
 * One enumerated facet: a trigger button and a portalled panel of checkboxes,
 * one per option, each toggling that option in or out of the caller's hidden
 * set. Anchored the same way the add-filter field picker is, so the panel
 * follows the bar as anything scrolls under it — and end-aligned, because a
 * facet trigger tends to sit near the right edge of whatever row it is in.
 */
import { Box } from '../../../primitives/Box';
import { Button } from '../../../primitives/Button';
import { Checkbox } from '../../../primitives/Checkbox';
import { Portal, useAnchorTracking } from '../../../primitives/Portal';
import { useAnchorMenu } from '../behavior/use-anchor-menu';
import type { FilterFacet } from '../FilterBar.type';
import '../FilterBar.css';

interface FacetPickerProps {
  facet: FilterFacet;
}

const FacetPicker = ({ facet }: FacetPickerProps) => {
  const menu = useAnchorMenu<HTMLButtonElement>('.filter-bar__facet-panel');

  const { position: pos } = useAnchorTracking({
    active: menu.open,
    anchorRef: menu.anchorRef,
    compute: (rect) => ({ top: rect.bottom, right: window.innerWidth - rect.right }),
    onOutOfView: menu.close,
  });

  return (
    <>
      <Button
        ref={menu.anchorRef}
        variant="tertiary"
        size="sm"
        className="filter-bar__facet-trigger"
        aria-haspopup="menu"
        aria-expanded={menu.open}
        onClick={menu.toggle}
      >
        {facet.label} ▾
      </Button>
      {menu.open && (
        <Portal layer="overlay">
          <Box
            className="filter-bar__facet-panel"
            style={pos ? { position: 'fixed', top: pos.top, right: pos.right } : undefined}
          >
            {facet.options.map((option) => (
              <Checkbox
                key={option.id}
                className="filter-bar__facet-row"
                checked={!facet.hidden.has(option.id)}
                onChange={() => facet.onToggle(option.id)}
                label={option.label}
              />
            ))}
          </Box>
        </Portal>
      )}
    </>
  );
};

export { FacetPicker };
export type { FacetPickerProps };
