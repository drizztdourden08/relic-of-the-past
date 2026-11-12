/* @layer renderer-app @kind component */
import { CROSS_PATH, DPAD_ARMS, HUB_RADIUS } from './DpadCross.constants';
import type { DpadCrossProps } from './DpadCross.type';
import './DpadCross.css';

const DpadCross = (props: DpadCrossProps) => {
  const { pressed, selected = false, className, style } = props;

  return (
    <svg
      className={['dpad-cross', className].filter(Boolean).join(' ')}
      style={style}
      viewBox="-100 -100 200 200"
      data-selected={selected || undefined}
      aria-hidden
    >
      <path className="dpad-cross__body" d={CROSS_PATH} />
      {DPAD_ARMS.map((arm) => (
        <g key={arm.key} data-pressed={pressed[arm.key] || undefined} className="dpad-cross__arm">
          <rect className="dpad-cross__arm-fill" {...arm.rect} rx={10} />
          <path className="dpad-cross__notch" d={arm.notch} />
        </g>
      ))}
      <circle className="dpad-cross__hub" r={HUB_RADIUS} />
    </svg>
  );
};

export { DpadCross };
