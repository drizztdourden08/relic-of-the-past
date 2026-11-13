/* @layer renderer-app @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { basePx, toPx } from '@rotp/input-mapping';
import { TouchButton } from '@app/compounds/TouchButton';
import { TouchDpad } from '@app/compounds/TouchDpad';
import { TouchGroupFrame } from '@app/compounds/TouchGroupFrame';
import { TouchStick } from '@app/compounds/TouchStick';
import { TouchZone } from '@app/compounds/TouchZone';
import { groupFrameRects } from '../../behavior/group-frame-rects';
import { movementGeometry } from '../../behavior/movement-geometry';
import { NO_PRESS } from './TouchEditorVisuals.constants';
import './TouchEditorVisuals.css';
import type { TouchEditorVisualsProps } from './TouchEditorVisuals.type';

const TouchEditorVisuals = (props: TouchEditorVisualsProps) => {
  const { layout, box, strength, selection } = props;
  const base = basePx(box);
  const geometry = movementGeometry(layout, box);
  const movementSelected = selection?.kind === 'movement';
  const selectedButton = selection?.kind === 'button'
    ? layout.buttons.find((button) => button.id === selection.id)
    : undefined;

  const renderMovement = () => {
    if (geometry.zone) return <TouchZone rect={geometry.zone} strength={strength} selected={movementSelected} />;
    if (!geometry.centre) return null;
    if (layout.movementType === 'dpad') {
      return (
        <TouchDpad
          center={geometry.centre}
          radiusPx={geometry.radiusPx}
          pressed={NO_PRESS}
          strength={strength}
          selected={movementSelected}
        />
      );
    }
    return (
      <TouchStick
        base={geometry.centre}
        knob={geometry.centre}
        radiusPx={geometry.radiusPx}
        strength={strength}
        active={movementSelected}
      />
    );
  };

  return (
    <Box className="touch-editor-visuals">
      {renderMovement()}
      {groupFrameRects(layout, box).map((frame) => (
        <TouchGroupFrame
          key={frame.id}
          rect={frame.rect}
          locked={frame.locked}
          selected={selectedButton?.group === frame.id}
        />
      ))}
      {layout.buttons.map((button) => (
        <TouchButton
          key={button.id}
          label={button.label}
          form={button}
          sizePx={base * button.scale}
          center={toPx(button.at, box)}
          pressed={false}
          strength={strength}
          selected={selectedButton?.id === button.id}
        />
      ))}
    </Box>
  );
};

export { TouchEditorVisuals };
