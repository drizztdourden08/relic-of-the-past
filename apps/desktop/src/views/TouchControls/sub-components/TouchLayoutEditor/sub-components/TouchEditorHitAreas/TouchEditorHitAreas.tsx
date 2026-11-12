/* @layer renderer-app @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { basePx, moveButton, moveMovement, resizeZone, toPx } from '@rotp/input-mapping';
import { movementGeometry } from '../../behavior/movement-geometry';
import { MIN_HIT_PX, RESIZE_HANDLE_PX } from '../../TouchLayoutEditor.constants';
import './TouchEditorHitAreas.css';
import type { TouchEditorHitAreasProps } from './TouchEditorHitAreas.type';

const TouchEditorHitAreas = (props: TouchEditorHitAreasProps) => {
  const { layout, box, drag, onSelect } = props;
  const base = basePx(box);
  const geometry = movementGeometry(layout, box);
  const pointerHandlers = {
    onPointerMove: drag.move,
    onPointerUp: drag.end,
    onPointerCancel: drag.cancel,
  };

  const movementArea = () => {
    if (geometry.zone) return geometry.zone;
    if (!geometry.centre) return null;
    const half = Math.max(geometry.radiusPx, MIN_HIT_PX / 2);
    return { left: geometry.centre.x - half, top: geometry.centre.y - half, width: half * 2, height: half * 2 };
  };
  const movement = movementArea();

  return (
    <Box className="touch-editor-hit" {...pointerHandlers}>
      {movement && (
        <Box
          className={`touch-editor-hit__area${geometry.zone ? '' : ' touch-editor-hit__area--round'}`}
          style={movement}
          onPointerDown={(event) => drag.begin(event, moveMovement, () => onSelect({ kind: 'movement' }))}
        />
      )}
      {geometry.zone && (
        <Box
          className="touch-editor-hit__handle"
          style={{
            left: geometry.zone.left + geometry.zone.width - RESIZE_HANDLE_PX,
            top: geometry.zone.top + geometry.zone.height - RESIZE_HANDLE_PX,
            width: RESIZE_HANDLE_PX,
            height: RESIZE_HANDLE_PX,
          }}
          onPointerDown={(event) => drag.begin(event, resizeZone, () => onSelect({ kind: 'movement' }))}
        />
      )}
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
