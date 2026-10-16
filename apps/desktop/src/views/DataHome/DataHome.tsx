/* @layer renderer-components @kind component */
import { SectionHeader, Stack } from '@drizztdourden08/tessera/primitives';
import { DataSections } from '@app/compounds/DataSections';
import { DataStorageDetails } from '@app/compounds/DataStorageDetails';
import { DATA_BUCKET, DATA_SECTION_GROUPS } from './DataHome.constants';
import type { DataHomeProps } from './DataHome.type';

const DataHome = (props: DataHomeProps) => {
  const { summary, loading, open } = props;

  return (
    <Stack gap="xl">
      <Stack as="section" gap="md" aria-label="Sections">
        <SectionHeader level={2} title="Sections" subtitle="Each part of the data area, and what you do there." />
        <DataSections groups={DATA_SECTION_GROUPS} onOpen={(page) => open(`${DATA_BUCKET}/${page}`)} />
      </Stack>
      <Stack as="section" gap="md" aria-label="Storage details">
        <SectionHeader level={2} title="Storage details" subtitle="Where the data lives and how much each folder uses." />
        <DataStorageDetails summary={summary} loading={loading} />
      </Stack>
    </Stack>
  );
};

export { DataHome };
