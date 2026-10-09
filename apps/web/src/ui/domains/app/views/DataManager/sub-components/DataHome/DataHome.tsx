/* @layer renderer-components @kind component */
import { usePlatform } from '@app/platform';
import { Box, Text, Button, Icon, Spinner } from '@drizztdourden08/tessera/primitives';
import { useStorageSummary } from './behavior/useStorageSummary';
import { formatBytes } from './behavior/formatBytes';
import { DomainTiles } from './sub-components/DomainTiles';
import './DataHome.css';

const DataHome = () => {
  const { storage, capabilities } = usePlatform();
  const { summary, loading, refresh } = useStorageSummary(storage);

  return (
    <Box className="data-home">
      <Box className="data-home__location">
        <Box className="data-home__location-text">
          <Text className="data-home__os">{summary?.location.osLabel ?? '...'}</Text>
          <Text className="data-home__path">{summary?.location.path ?? ''}</Text>
        </Box>
        {capabilities.revealDataFolder ? (
          <Button variant="secondary" size="sm" onClick={() => storage.reveal()}>Open data folder</Button>
        ) : (
          <Text className="data-home__hint">Stored in app storage on this device</Text>
        )}
      </Box>

      {summary ? <DomainTiles domains={summary.domains} /> : loading && (
        <Box className="data-home__loading"><Spinner size="sm" /></Box>
      )}

      <Box className="data-home__footer">
        <Text className="data-home__total">Total on disk: {formatBytes(summary?.totalBytes ?? 0)}</Text>
        <Button variant="ghost" size="sm" icon={<Icon name="refresh-cw" />} onClick={refresh}>Refresh</Button>
      </Box>
    </Box>
  );
};

export { DataHome };
