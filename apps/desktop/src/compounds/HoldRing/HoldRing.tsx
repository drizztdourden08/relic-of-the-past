/* @layer renderer-app @kind component */
import { ProgressRing } from '@app/primitives/ProgressRing';
import { RING_SIZE } from './HoldRing.constants';
import type { HoldRingProps } from './HoldRing.type';
import './HoldRing.css';

const HoldRing = (props: HoldRingProps) => {
  const { center, progress } = props;
  const half = RING_SIZE / 2;

  return (
    <ProgressRing
      className="hold-ring"
      style={{ left: center.x - half, top: center.y - half }}
      size={RING_SIZE}
      progress={progress}
    />
  );
};

export { HoldRing };
