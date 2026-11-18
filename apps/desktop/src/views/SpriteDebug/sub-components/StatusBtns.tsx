/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import type { ReviewStatus } from '../SpriteDebug.type';
import { statusOptionsOf } from '../SpriteDebug.constants';

const StatusBtns = ({ current, onClick }: { current: ReviewStatus; onClick: (s: ReviewStatus) => void }) => {
  const t = useT();
  return <SegmentedControl size="sm" value={current} options={statusOptionsOf(t)} onChange={onClick} />;
};

export { StatusBtns };
