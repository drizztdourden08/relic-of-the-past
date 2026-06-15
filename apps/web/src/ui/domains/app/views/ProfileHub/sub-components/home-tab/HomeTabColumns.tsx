/* @layer renderer-components @kind component */
/** Home tab two-column layout: quick saves + sessions (left), normal + auto saves (right). */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Text } from '../../../../../../design-system/primitives/Text';
import { SaveSlot } from '../../../../compounds/SaveSlot';
import { NormalSaveCard } from '../../../../compounds/NormalSaveCard';
import { AutoSaveCard } from '../../../../compounds/AutoSaveCard';
import { PlaySessionCard } from '../../../../compounds/PlaySessionCard';
import type { HomeTabSaves } from './useHomeTabSaves';

const HomeTabColumns = ({ saves, isGameRunning }: { saves: HomeTabSaves; isGameRunning: boolean }) => {
  const {
    slots, busySlot, handleQuickSave, handleQuickLoad, sessions,
    normalSaves, normalScreenshots, busyNormal, handleCreateNormalSave, handleLoadNormal,
    handleOverwriteNormal, handleDeleteNormal, handleRenameNormal,
    autoSaves, autoScreenshots, busyAuto, handleLoadAuto, handleDeleteAuto,
  } = saves;
  return (
    <Box className="home-tab__columns">
      {/* Left column: Quick Saves + Play Sessions */}
      <Box className="home-tab__col-left">
        <Box as="section" className="home-tab__section">
          <Text as="h3" className="home-tab__section-title">Quick Saves</Text>
          <Box className="home-tab__save-grid">
            {slots.map((s) => (
              <SaveSlot
                key={s.slot}
                slot={s.slot}
                screenshotUrl={s.screenshot}
                timestamp={s.timestamp ?? 0}
                isEmpty={!s.timestamp}
                busy={busySlot === s.slot}
                disableSave={!isGameRunning}
                onSave={handleQuickSave}
                onLoad={handleQuickLoad}
              />
            ))}
          </Box>
        </Box>

        <Box as="section" className="home-tab__section">
          <Text as="h3" className="home-tab__section-title">Play Sessions</Text>
          {sessions.length === 0 ? (
            <Text as="p" className="home-tab__empty">No play sessions yet</Text>
          ) : (
            <Box className="home-tab__sessions">
              {sessions.map((s) => (
                <PlaySessionCard key={s.id} session={s} />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Right column: Normal Saves + Auto Saves */}
      <Box className="home-tab__col-right">
        <Box as="section" className="home-tab__section">
          <Box className="home-tab__section-header">
            <Text as="h3" className="home-tab__section-title">Saves</Text>
            <Button
              variant="bare"
              className="home-tab__new-save-btn"
              onClick={handleCreateNormalSave}
              disabled={!isGameRunning}
              title={isGameRunning ? 'Create a new save' : 'Start game to save'}
            >
              + New Save
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
      </Box>
    </Box>
  );
};

export { HomeTabColumns };
