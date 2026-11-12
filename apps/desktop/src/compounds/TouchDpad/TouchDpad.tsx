/* @layer renderer-app @kind component */
import type { CSSProperties } from 'react';
import { CROSS_PATH, DPAD_ARMS, HUB_RADIUS } from './TouchDpad.constants';
import type { TouchDpadProps } from './TouchDpad.type';
import './TouchDpad.css';

const TouchDpad = (props: TouchDpadProps) => {
  const { center, radiusPx, pressed, strength, selected = false } = props;
  const style = {
    left: center.x - radiusPx,
    top: center.y - radiusPx,
    width: radiusPx * 2,
    height: radiusPx * 2,
    '--touch-strength': strength,
  } as CSSProperties;

  return (
    <svg className="touch-dpad" style={style} viewBox="-100 -100 200 200" data-selected={selected || undefined}>
      <path className="touch-dpad__body" d={CROSS_PATH} />
      {DPAD_ARMS.map((arm) => (
        <g key={arm.key} data-pressed={pressed[arm.key] || undefined} className="touch-dpad__arm">
          <rect className="touch-dpad__arm-fill" {...arm.rect} rx={10} />
          <path className="touch-dpad__notch" d={arm.notch} />
        </g>
      ))}
      <circle className="touch-dpad__hub" r={HUB_RADIUS} />
    </svg>
  );
};

export { TouchDpad };
