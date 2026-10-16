/* @layer renderer-components @kind component */
import { EmptyState, Spinner } from '@drizztdourden08/tessera/primitives';
import type { EditorBodyProps } from './studio-frame.type';

const EditorBody = (props: EditorBodyProps) => {
  const { id, loading, error, ready, children } = props;

  if (!id) return <EmptyState message="Select a language set to edit" />;
  if (loading) return <Spinner />;
  if (error || !ready) return <EmptyState message={error ?? 'That language set could not be read'} />;
  return <>{children}</>;
};

export { EditorBody };
