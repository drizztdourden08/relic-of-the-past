/* @layer renderer-components @kind component */
import { Icon } from '@drizztdourden08/tessera/primitives';
import type { InputStatus } from '../hid-calibration.type';

const InputStatusIcon = ({ status }: { status: InputStatus }) => {
  if (status === 'captured') return <Icon name="check" />;
  if (status === 'skipped') return <Icon name="x" />;
  if (status === 'active') return <Icon name="play" />;
  return <>-</>;
};

export { InputStatusIcon };
