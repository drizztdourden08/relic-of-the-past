/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { StudioNoticesProps } from './studio-frame.type';

const StudioNotices = (props: StudioNoticesProps) => {
  const { message, ok } = props;

  if (message === null) return null;
  return <Text variant="caption" tone={ok ? 'muted' : 'danger'} role="status">{message}</Text>;
};

export { StudioNotices };
