/* @layer renderer-app @kind component */
import { useMemo } from 'react';
import { formatBytes } from '@drizztdourden08/brock-core';
import { usePlatform } from '@drizztdourden08/brock-react';
import type { HeroProps, ScreenMeta } from '@drizztdourden08/brock-react';
import { Button, Icon, Spinner, Text } from '@drizztdourden08/tessera/primitives';
import { DomainTiles } from '@domains/app/views/DataManager/sub-components/data-overview/DomainTiles';
import { useStorageSummary } from '@domains/app/views/DataManager/sub-components/data-overview/useStorageSummary';

const meta: ScreenMeta = { title: 'Home', icon: 'house', keywords: ['data', 'overview', 'disk', 'folder', 'total', 'library'] };

const DataHomeHero = (props: HeroProps) => {
  const { slots, open } = props;
  const { Eyebrow, Title, Actions, Tools, Facts, Aside, Panel } = slots;
  const { storage, capabilities } = usePlatform();
  const { summary, loading, refresh } = useStorageSummary(storage);
  const facts = useMemo(() => [[
    { label: 'Location', value: summary?.location.osLabel ?? '...' },
    { label: 'Folder', value: summary?.location.path ?? '', mono: true, copyable: true },
    { label: 'Total on disk', value: formatBytes(summary?.totalBytes ?? 0), mono: true },
  ]], [summary]);

  return (
    <>
      <Eyebrow>Data</Eyebrow>
      <Title>Your library</Title>
      <Actions>
        <Button variant="primary" onClick={() => open('data/profiles')}>Profiles</Button>
        <Button variant="secondary" onClick={() => open('data/roms')}>ROMs</Button>
      </Actions>
      <Tools>
        {capabilities.revealDataFolder && <Button size="sm" variant="secondary" onClick={() => void storage.reveal()}>Open data folder</Button>}
        <Button size="sm" variant="ghost" icon={<Icon name="refresh-cw" />} onClick={refresh}>Refresh</Button>
      </Tools>
      <Facts rows={facts} />
      {!capabilities.revealDataFolder && <Aside><Text variant="body">Stored in app storage on this device.</Text></Aside>}
      <Panel>{summary ? <DomainTiles domains={summary.domains} /> : loading && <Spinner size="sm" />}</Panel>
    </>
  );
};

export default DataHomeHero;
export { meta };
