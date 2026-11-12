/* @layer renderer-app @kind component */
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { orientationOf } from '@rotp/input-mapping';
import { useTouchControlsStore } from '@app/stores/touch-controls-store';
import { useMenuHold } from '../../behavior/useMenuHold';
import { useOverlayBox } from '../../behavior/useOverlayBox';
import { useTouchHaptics } from '../../behavior/useTouchHaptics';
import { useTouchPointers } from '../../behavior/useTouchPointers';
import { TouchLayoutEditor } from '../TouchLayoutEditor';
import { TouchPlayLayer } from '../TouchPlayLayer';
import type { TouchSurfaceProps } from './TouchSurface.type';

const TouchSurface = (props: TouchSurfaceProps) => {
  const { touch, updateTouch, updateLayout } = props;
  const ref = useRef<HTMLDivElement>(null);
  const box = useOverlayBox(ref);
  const orientation = orientationOf(box);
  const layout = touch.layouts[orientation];
  const editing = useTouchControlsStore((s) => s.editing);
  const setEditing = useTouchControlsStore((s) => s.setEditing);
  const setMenuOpen = useTouchControlsStore((s) => s.setMenuOpen);
  const tick = useTouchHaptics(touch.haptics);

  const hold = useMenuHold(touch.menuHoldMs, () => {
    tick();
    setMenuOpen(true);
  });
  const { view, handlers } = useTouchPointers({ layout, box, enabled: !editing && box.width > 0, hold, onPress: tick });

  const style = { '--touch-layer': touch.layerOpacity } as CSSProperties;

  return (
    <Box
      className="touch-controls"
      ref={ref}
      style={style}
      data-orientation={orientation}
      onContextMenu={(event) => event.preventDefault()}
      {...handlers}
    >
      {box.width > 0 && !editing && (
        <TouchPlayLayer layout={layout} box={box} strength={touch.buttonStrength} view={view} ring={hold.ring} />
      )}
      {box.width > 0 && editing && (
        <TouchLayoutEditor
          layout={layout}
          orientation={orientation}
          box={box}
          touch={touch}
          onSave={(saved, shared) => {
            updateLayout(orientation, saved);
            updateTouch(shared);
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </Box>
  );
};

export { TouchSurface };
