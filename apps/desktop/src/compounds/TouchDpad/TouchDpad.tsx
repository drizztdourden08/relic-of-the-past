/* @layer renderer-app @kind component */
import type { CSSProperties } from 'react';
import { DpadCross } from '@app/primitives/DpadCross';
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

  return <DpadCross className="touch-dpad" style={style} pressed={pressed} selected={selected} />;
};

export { TouchDpad };
