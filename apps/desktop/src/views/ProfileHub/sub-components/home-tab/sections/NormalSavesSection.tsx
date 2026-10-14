/* @layer renderer-components @kind component */
import { Box, Button, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { NormalSaveCard } from '../../../../../compounds/NormalSaveCard';
import type { HomeTabColumnsProps } from '../home-tab.type';

const NormalSavesSection = ({ saves, isGameRunning }: HomeTabColumnsProps) => {
  const {
    normalSaves, normalScreenshots, busyNormal, handleCreateNormalSave, handleLoadNormal,
    handleOverwriteNormal, handleDeleteNormal, handleRenameNormal,
  } = saves;
  return (
    <Box as="section" className="home-tab__section">
      <Box className="home-tab__section-header">
        <Text as="h3" className="home-tab__section-title">Saves</Text>
        <Button
          variant="secondary"
          size="xs"
          icon={<Icon name="plus" />}
          onClick={handleCreateNormalSave}
          disabled={!isGameRunning}
          title={isGameRunning ? 'Create a new save' : 'Start game to save'}
        >
          New Save
        </Button>
      </Box>
      {normalSaves.length === 0 ? (
        <Text as="p" className="home-tab__empty">No saves yet</Text>
      ) : (
        <Box className="home-tab__save-list">
          {normalSaves.map((s) => (
            <NormalSaveCard
              key={s.id}
              id={s.id}
              name={s.name}
              timestamp={s.timestamp}
              screenshotUrl={normalScreenshots[s.id] ?? null}
              busy={busyNormal === s.id}
              isGameRunning={isGameRunning}
              onLoad={handleLoadNormal}
              onOverwrite={handleOverwriteNormal}
              onDelete={handleDeleteNormal}
              onRename={handleRenameNormal}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export { NormalSavesSection };
