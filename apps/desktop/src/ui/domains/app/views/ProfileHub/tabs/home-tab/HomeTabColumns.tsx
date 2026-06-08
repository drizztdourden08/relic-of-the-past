/* @layer renderer-components @kind component */
/** Home tab two-column layout: quick saves + sessions (left), normal + auto saves (right). */
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
    <div className="home-tab__columns">
      {/* Left column: Quick Saves + Play Sessions */}
      <div className="home-tab__col-left">
        <section className="home-tab__section">
          <h3 className="home-tab__section-title">Quick Saves</h3>
          <div className="home-tab__save-grid">
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
          </div>
        </section>

        <section className="home-tab__section">
          <h3 className="home-tab__section-title">Play Sessions</h3>
          {sessions.length === 0 ? (
            <p className="home-tab__empty">No play sessions yet</p>
          ) : (
            <div className="home-tab__sessions">
              {sessions.map((s) => (
                <PlaySessionCard key={s.id} session={s} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Right column: Normal Saves + Auto Saves */}
      <div className="home-tab__col-right">
        <section className="home-tab__section">
          <div className="home-tab__section-header">
            <h3 className="home-tab__section-title">Saves</h3>
            <button
              className="home-tab__new-save-btn"
              onClick={handleCreateNormalSave}
              disabled={!isGameRunning}
              title={isGameRunning ? 'Create a new save' : 'Start game to save'}
            >
              + New Save
            </button>
          </div>
          {normalSaves.length === 0 ? (
            <p className="home-tab__empty">No saves yet</p>
          ) : (
            <div className="home-tab__save-list">
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
            </div>
          )}
        </section>

        <section className="home-tab__section">
          <h3 className="home-tab__section-title">Auto-Saves</h3>
          {autoSaves.length === 0 ? (
            <p className="home-tab__empty">No auto-saves yet</p>
          ) : (
            <div className="home-tab__save-list">
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
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export { HomeTabColumns };
