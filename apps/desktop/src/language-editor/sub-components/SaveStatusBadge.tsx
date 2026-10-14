/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import type { SaveStatusBadgeProps } from './SaveStatusBadge.type';
import { saveStatusOf } from './save-status-of';

const SaveStatusBadge = (props: SaveStatusBadgeProps) => {
  const { tone, text } = saveStatusOf(props);
  return <Status tone={tone}>{text}</Status>;
};

export { SaveStatusBadge };
