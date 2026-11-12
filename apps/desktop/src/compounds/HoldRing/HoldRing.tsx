/* @layer renderer-app @kind component */
import { RING_RADIUS, RING_SIZE } from './HoldRing.constants';
import type { HoldRingProps } from './HoldRing.type';
import './HoldRing.css';

const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const MID = RING_SIZE / 2;

const HoldRing = (props: HoldRingProps) => {
  const { center, progress } = props;
  const filled = CIRCUMFERENCE * Math.min(1, Math.max(0, progress));

  return (
    <svg
      className="hold-ring"
      style={{ left: center.x - MID, top: center.y - MID, width: RING_SIZE, height: RING_SIZE }}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
    >
      <circle className="hold-ring__track" cx={MID} cy={MID} r={RING_RADIUS} />
      <circle
        className="hold-ring__fill"
        cx={MID}
        cy={MID}
        r={RING_RADIUS}
        strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
        transform={`rotate(-90 ${MID} ${MID})`}
      />
    </svg>
  );
};

export { HoldRing };
