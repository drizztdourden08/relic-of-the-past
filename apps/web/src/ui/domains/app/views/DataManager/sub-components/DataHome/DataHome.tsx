/* @layer renderer-components @kind component */
import { usePlatform } from '@app/platform';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { Button } from '@ds/primitives/Button';
import { Spinner } from '@ds/primitives/Spinner';
import { useStorageSummary } from './behavior/useStorageSummary';
import { formatBytes } from './behavior/formatBytes';
import './DataHome.css';

const DOMAIN_ICONS: Record<string, string> = {
  profiles: '👤', roms: '🎮', sprites: '🖼️', languages: '🌐', msu: '🎵', assets: '📦', saves: '💾',
};

const DataHome = () => {
  const { storage, capabilities } = usePlatform();
  const { summary, loading, refresh } = useStorageSummary(storage);

  return (
    <Box className="data-home">
      <Box className="data-home__location">
        <Box className="data-home__location-text">
          <Text className="data-home__os">{summary?.location.osLabel ?? '…'}</Text>
          <Text className="data-home__path">{summary?.location.path ?? ''}</Text>
        </Box>
        {capabilities.revealDataFolder ? (
          <Button variant="secondary" size="sm" onClick={() => storage.reveal()}>Open data folder</Button>
        ) : (
          <Text className="data-home__hint">Stored in app storage on this device</Text>
        )}
      </Box>

      {loading && !summary ? (
        <Box className="data-home__loading"><Spinner size="sm" /></Box>
      ) : (
        <Box className="data-home__grid">
          {summary?.domains.map((d) => (
            <Box key={d.domain} className="data-home__card">
              <Text className="data-home__card-icon">{DOMAIN_ICONS[d.domain] ?? '📁'}</Text>
              <Text className="data-home__card-count">{d.count}</Text>
              <Text className="data-home__card-label">{d.label}</Text>
              <Text className="data-home__card-size">{formatBytes(d.bytes)}</Text>
            </Box>
          ))}
        </Box>
      )}

      <Box className="data-home__footer">
        <Text className="data-home__total">Total on disk: {formatBytes(summary?.totalBytes ?? 0)}</Text>
        <Button variant="bare" size="sm" onClick={refresh}>Refresh</Button>
      </Box>
    </Box>
  );
};

export { DataHome };
