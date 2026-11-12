/* @layer renderer-app @kind component */
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '@drizztdourden08/tessera/primitives';
import { basePx, movementRadiusPx, orientationOf, toPx } from '@rotp/input-mapping';
import { TouchButton } from '@app/compounds/TouchButton';
import { TouchDpad } from '@app/compounds/TouchDpad';
import { TouchStick } from '@app/compounds/TouchStick';
import { TouchZone } from '@app/compounds/TouchZone';
import { useOverlayBox } from '@app/views/TouchControls/behavior/useOverlayBox';
import { boundControl } from '../../behavior/bound-control';
import { useBindBoardPointers } from '../../behavior/useBindBoardPointers';
import { BOARD_STRENGTH, NO_PRESS } from './TouchBindBoard.constants';
import type { TouchBindBoardProps } from './TouchBindBoard.type';
import './TouchBindBoard.css';

const TouchBindBoard = (props: TouchBindBoardProps) => {
  const { touch, current, onPick } = props;
  const ref = useRef<HTMLDivElement>(null);
  const box = useOverlayBox(ref);
  const layout = touch.layouts[orientationOf(box)];
  const { stick, handlers } = useBindBoardPointers({ layout, box, onPick });
  const bound = boundControl(layout, current);
  const style = { '--touch-bind-aspect': window.innerWidth / window.innerHeight } as CSSProperties;

  const size = basePx(box);
  const radius = movementRadiusPx(layout, box);
  const { movementType, movements } = layout;
  const fixedBase = movementType === 'fixed-stick' ? toPx(movements['fixed-stick'].at, box) : null;
  const shownStick = stick ?? (fixedBase ? { base: fixedBase, knob: fixedBase } : null);
  const zone = movementType === 'dynamic-stick' ? movements['dynamic-stick'].zone : null;

  return (
    <Box className="touch-bind-board" ref={ref} style={style} {...handlers}>
      {box.width > 0 && (
        <>
          {zone && (
            <TouchZone
              rect={{ left: zone.x * box.width, top: zone.y * box.height, width: zone.w * box.width, height: zone.h * box.height }}
              strength={BOARD_STRENGTH}
              selected={bound.movement}
            />
          )}
          {layout.buttons.map((button) => (
            <TouchButton
              key={button.id}
              label={button.label}
              shape={button.shape}
              sizePx={size * button.scale}
              center={toPx(button.at, box)}
              pressed={false}
              strength={BOARD_STRENGTH}
              selected={bound.buttonId === button.id}
            />
          ))}
          {shownStick && (
            <TouchStick base={shownStick.base} knob={shownStick.knob} radiusPx={radius} strength={BOARD_STRENGTH} active={stick !== null || bound.movement} />
          )}
          {movementType === 'dpad' && (
            <TouchDpad center={toPx(movements.dpad.at, box)} radiusPx={radius} pressed={NO_PRESS} strength={BOARD_STRENGTH} selected={bound.movement} />
          )}
        </>
      )}
    </Box>
  );
};

export { TouchBindBoard };
