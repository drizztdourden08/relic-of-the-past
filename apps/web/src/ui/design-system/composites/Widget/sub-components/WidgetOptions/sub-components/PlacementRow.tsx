/* @layer renderer-components @kind component */
/**
 * The placement controls: four dock edges and float as icon buttons, the current
 * one lit, then a text button that moves the widget to its own window, or back
 * into the app when it is already out.
 */
import { Box } from '../../../../../primitives/Box';
import { Button } from '../../../../../primitives/Button';
import { IconButton } from '../../../../../primitives/IconButton';
import { PLACEMENT_BUTTONS } from '../WidgetOptions.constants';
import type { DockEdge, WidgetPlacement } from '../WidgetOptions.type';

interface PlacementRowProps {
  placement: WidgetPlacement;
  dockEdge?: DockEdge;
  onDock: (edge: DockEdge) => void;
  onFloat: () => void;
  onPopOut: () => void;
  canPopOut?: boolean;
}

const PlacementRow = (props: PlacementRowProps) => {
  const { placement, dockEdge, onDock, onFloat, onPopOut, canPopOut = true } = props;

  const isLit = (edge: DockEdge | null): boolean =>
    edge === null ? placement === 'floating' : placement === 'docked' && dockEdge === edge;

  return (
    <Box className="widget-options__placement">
      <Box className="widget-options__placement-buttons">
        {PLACEMENT_BUTTONS.map(({ edge, glyph, label }) => (
          <IconButton
            key={label}
            size="sm"
            variant="ghost"
            label={label}
            title={label}
            active={isLit(edge)}
            onClick={() => (edge === null ? onFloat() : onDock(edge))}
          >
            {glyph}
          </IconButton>
        ))}
      </Box>
      {placement === 'popped' ? (
        <Button size="sm" variant="tertiary" onClick={onPopOut} title="Back into the app, where it was docked before">
          Pop in
        </Button>
      ) : canPopOut && (
        <Button size="sm" variant="tertiary" onClick={onPopOut}>
          Pop out
        </Button>
      )}
    </Box>
  );
};

export { PlacementRow };
export type { PlacementRowProps };
