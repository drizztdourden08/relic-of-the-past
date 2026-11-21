/* @layer renderer-components @kind component */
import { Status } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import type { SaveStatusBadgeProps } from './SaveStatusBadge.type';
import { saveStatusOf } from './save-status-of';

const SaveStatusBadge = (props: SaveStatusBadgeProps) => {
  const t = useT();
  const { tone, text } = saveStatusOf(t, props);
  return <Status tone={tone}>{text}</Status>;
};

export { SaveStatusBadge };
