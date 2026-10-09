/* @layer renderer-components @kind component */
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import type { ReviewStatus } from '../SpriteDebug.type';
import { STATUS_OPTIONS } from '../SpriteDebug.constants';

const StatusBtns = ({ current, onClick }: { current: ReviewStatus; onClick: (s: ReviewStatus) => void }) => (
  <SegmentedControl size="sm" value={current} options={STATUS_OPTIONS} onChange={onClick} />
);

export { StatusBtns };
