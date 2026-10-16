/* @layer renderer-components @kind component */
import { Center, EmptyState, Spinner } from '@drizztdourden08/tessera/primitives';
import { NO_PACK_MESSAGE } from './studio-frame.constants';
import type { EditorBodyProps } from './studio-frame.type';

const EditorBody = (props: EditorBodyProps) => {
  const { hasPack, loading, children } = props;

  if (!hasPack) return <EmptyState message={NO_PACK_MESSAGE} />;
  if (loading) return <Center><Spinner /></Center>;
  return <>{children}</>;
};

export { EditorBody };
