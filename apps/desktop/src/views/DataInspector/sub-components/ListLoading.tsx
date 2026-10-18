/* @layer renderer-app @kind component */
import { EmptyState, Spinner } from '@drizztdourden08/tessera/primitives';
import type { ListLoadingProps } from './ListLoading.type';

const ListLoading = (props: ListLoadingProps) => {
  const { label } = props;
  return <EmptyState className="data-inspector__loading" icon={<Spinner size="lg" label={label} />} message={label} />;
};

export { ListLoading };
