/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import type { StudioStatusProps } from './studio-frame.type';

const StudioStatus = (props: StudioStatusProps) => {
  const { format, readOnly } = props;

  return (
    <>
      <Status tone={format === 'layered' ? 'success' : 'neutral'}>{format === 'layered' ? 'Layered' : 'Classic'}</Status>
      {readOnly && <Status tone="neutral">Read only</Status>}
    </>
  );
};

export { StudioStatus };
