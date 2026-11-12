/* @layer renderer-app @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { basePx, moveButton, moveGroup, moveMovement, resizeZone, toPx } from '@rotp/input-mapping';
import { groupFrameRects } from '../../behavior/group-frame-rects';
import { MIN_HIT_PX } from '../../TouchLayoutEditor.constants';
import { groupSelection } from './behavior/group-selection';
import { movementHitRects } from './behavior/movement-hit-rects';
import './TouchEditorHitAreas.css';
import type { TouchEditorHitAreasProps } from './TouchEditorHitAreas.type';

const TouchEditorHitAreas = (props: TouchEditorHitAreasProps) => {
  const { layout, box, drag, onSelect } = props;
  const base = basePx(box);
  const movement = movementHitRects(layout, box);
  const selectMovement = (): void => onSelect({ kind: 'movement' });

  return (
    <Box className="touch-editor-hit" onPointerMove={drag.move} onPointerUp={drag.end} onPointerCancel={drag.cancel}>
      {movement.area && (
        <Box
          className={`touch-editor-hit__area${movement.round ? ' touch-editor-hit__area--round' : ''}`}
          style={movement.area}
          onPointerDown={(event) => drag.begin(event, moveMovement, selectMovement)}
        />
      )}
      {movement.handle && (
        <Box
          className="touch-editor-hit__handle"
          style={movement.handle}
          onPointerDown={(event) => drag.begin(event, resizeZone, selectMovement)}
        />
      )}
      {groupFrameRects(layout, box).map((frame) => (
        <Box
          key={`group-${frame.id}`}
          className="touch-editor-hit__area"
          style={frame.rect}
          onPointerDown={(event) => drag.begin(
            event,
            (start, delta, snap, screen) => moveGroup(start, { groupId: frame.id, delta, snap, box: screen }),
            () => onSelect(groupSelection(layout, frame.id)),
          )}
        />
      ))}
      {layout.buttons.map((button) => {
        const centre = toPx(button.at, box);
        const size = Math.max(base * button.scale, MIN_HIT_PX);
        return (
          <Box
            key={button.id}
            className="touch-editor-hit__area touch-editor-hit__area--round"
            style={{ left: centre.x - size / 2, top: centre.y - size / 2, width: size, height: size }}
            onPointerDown={(event) => drag.begin(
              event,
              (start, delta, snap, screen) => moveButton(start, { id: button.id, delta, snap, box: screen }),
              () => onSelect({ kind: 'button', id: button.id }),
            )}
          />
        );
      })}
    </Box>
  );
};

export { TouchEditorHitAreas };
