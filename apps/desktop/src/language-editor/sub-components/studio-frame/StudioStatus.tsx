/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { SaveStatusBadge } from '../SaveStatusBadge';
import type { StudioStatusProps } from './studio-frame.type';

const StudioStatus = (props: StudioStatusProps) => {
  const { exportStatus, ...save } = props;

  return (
    <>
      {exportStatus && <Text variant="caption" tone="muted">{exportStatus}</Text>}
      <SaveStatusBadge {...save} />
    </>
  );
};

export { StudioStatus };
