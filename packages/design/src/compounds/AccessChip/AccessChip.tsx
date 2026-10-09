/* @layer site-kit @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import { ACCESS_STATUSES } from './AccessChip.constants';
import type { AccessChipProps } from './AccessChip.type';

const AccessChip = (props: AccessChipProps) => {
  const { state, className } = props;
  return <Status variant="pill" map={ACCESS_STATUSES} value={state} className={className} />;
};

export { AccessChip };
