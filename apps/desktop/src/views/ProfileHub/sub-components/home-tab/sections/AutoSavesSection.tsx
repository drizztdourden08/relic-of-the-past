/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { AutoSaveCard } from '../../../../../compounds/AutoSaveCard';
import type { HomeTabColumnsProps } from '../home-tab.type';

const AutoSavesSection = ({ saves }: HomeTabColumnsProps) => {
  const { autoSaves, autoScreenshots, busyAuto, handleLoadAuto, handleDeleteAuto } = saves;
  return (
    <Box as="section" className="home-tab__section">
      <Text as="h3" className="home-tab__section-title">Auto-Saves</Text>
      {autoSaves.length === 0 ? (
        <Text as="p" className="home-tab__empty">No auto-saves yet</Text>
      ) : (
        <Box className="home-tab__save-list">
          {autoSaves.map((s) => (
            <AutoSaveCard
              key={s.id}
              id={s.id}
              timestamp={s.timestamp}
              trigger={s.trigger}
              screenshotUrl={autoScreenshots[s.id] ?? null}
              busy={busyAuto === s.id}
              onLoad={handleLoadAuto}
              onDelete={handleDeleteAuto}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export { AutoSavesSection };
