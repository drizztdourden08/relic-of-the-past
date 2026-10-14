/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { ChoiceCursor } from './ChoiceCursor';
import type { SlotCursorProps } from './preview.type';

const SlotCursor = (props: SlotCursorProps) => {
  const { atCursor, atOption, sheet, metrics } = props;
  if (atCursor) return <ChoiceCursor sheet={sheet} metrics={metrics} />;
  return atOption ? <Box as="span" className="preview-cursor preview-cursor--blank" aria-hidden="true" /> : null;
};

export { SlotCursor };
