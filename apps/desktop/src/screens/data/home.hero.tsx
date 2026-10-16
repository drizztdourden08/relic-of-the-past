/* @layer renderer-app @kind component */
import { useMemo } from 'react';
import { usePlatform } from '@drizztdourden08/brock-react';
import type { HeroProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { Button, Icon } from '@drizztdourden08/tessera/primitives';
import { DataHome, dataHomeFacts } from '@app/views/DataHome';
import { useStorageSummary } from '@app/views/DataManager/sub-components/data-overview/useStorageSummary';

const meta: ScreenMeta = { title: 'Home', icon: 'house', keywords: ['data', 'overview', 'disk', 'folder', 'total', 'library'] };

const DataHomeHero = (props: HeroProps) => {
  const { slots, open } = props;
  const { Eyebrow, Title, Actions, Tools, Facts } = slots;
  const { storage, capabilities } = usePlatform();
  const { summary, loading, refresh } = useStorageSummary(storage);
  const facts = useMemo(() => dataHomeFacts(summary), [summary]);

  return (
    <>
      <Eyebrow>Data</Eyebrow>
      <Title>Your library</Title>
      {capabilities.revealDataFolder && (
        <Actions>
          <Button variant="primary" icon={<Icon name="folder-open" />} onClick={() => void storage.reveal()}>Open data folder</Button>
        </Actions>
      )}
      <Tools>
        <Button size="sm" variant="ghost" icon={<Icon name="refresh-cw" />} onClick={refresh}>Refresh</Button>
      </Tools>
      <Facts rows={facts} />
      <DataHome summary={summary} loading={loading} open={open} />
    </>
  );
};

export default DataHomeHero;
export { meta };
