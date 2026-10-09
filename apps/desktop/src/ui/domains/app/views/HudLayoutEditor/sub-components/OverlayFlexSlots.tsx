/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { INSET } from './ContainerOverlay.constants';
import type { OverlayFlexSlotsProps } from './ContainerOverlay.type';

const OverlayFlexSlots = (props: OverlayFlexSlotsProps) => {
  const { slots, color } = props;
  return (
    <>
      {slots.map((slot, i) => (
        <Box
          key={`s${i}`}
          className="hud-overlay__slot"
          style={{
            left: slot.x + INSET,
            top: slot.y + INSET,
            width: Math.max(slot.w - INSET * 2, 0),
            height: Math.max(slot.h - INSET * 2, 0),
            borderColor: color,
          }}
        />
      ))}
    </>
  );
};

export { OverlayFlexSlots };
