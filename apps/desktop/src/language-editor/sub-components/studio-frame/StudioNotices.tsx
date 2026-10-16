/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { StudioNoticesProps } from './studio-frame.type';

const StudioNotices = (props: StudioNoticesProps) => {
  const { exportStatus } = props;

  if (!exportStatus) return null;
  return <Text variant="caption" role="status">{exportStatus}</Text>;
};

export { StudioNotices };
