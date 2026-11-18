/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { SectionHeader, Stack } from '@drizztdourden08/tessera/primitives';
import { DataSections } from '@app/compounds/DataSections';
import { DataStorageDetails } from '@app/compounds/DataStorageDetails';
import { DATA_BUCKET, dataSectionGroups } from './DataHome.constants';
import type { DataHomeProps } from './DataHome.type';

const DataHome = (props: DataHomeProps) => {
  const { summary, loading, open } = props;
  const t = useT();

  return (
    <Stack gap="xl">
      <Stack as="section" gap="md" aria-label={t('views-data-home:sections.title')}>
        <SectionHeader level={2} title={t('views-data-home:sections.title')} />
        <DataSections groups={dataSectionGroups(t)} onOpen={(page) => open(`${DATA_BUCKET}/${page}`)} />
      </Stack>
      <Stack as="section" gap="md" aria-label={t('views-data-home:storage.title')}>
        <SectionHeader level={2} title={t('views-data-home:storage.title')} />
        <DataStorageDetails summary={summary} loading={loading} />
      </Stack>
    </Stack>
  );
};

export { DataHome };
