/* @layer renderer-components @kind component */
import { EmptyState, Spinner, Stack } from '@drizztdourden08/tessera/primitives';
import { FactsPanel } from '@drizztdourden08/tessera/composites';
import { locationFacts } from './behavior/location-facts';
import { DomainTiles } from './sub-components/DomainTiles';
import type { DataStorageDetailsProps } from './DataStorageDetails.type';

const DataStorageDetails = (props: DataStorageDetailsProps) => {
  const { summary, loading } = props;

  if (summary === null) return loading ? <Spinner size="sm" /> : <EmptyState size="sm" message="Storage details are not available." />;

  return (
    <Stack gap="md">
      <FactsPanel layout="rows" align="end" label="Data folder" groups={locationFacts(summary.location)} />
      <DomainTiles domains={summary.domains} />
    </Stack>
  );
};

export { DataStorageDetails };
