import { useState, useEffect, useCallback } from 'react';
import type { PlaySession } from '@shared/types/session';
import { SaveSlot } from '../../../compounds/SaveSlot';
import { PlaySessionCard } from '../../../compounds/PlaySessionCard';
import { listSessions } from '../../../../lib/game/session-tracker';
import { saveState, loadState, subscribeGameState } from '../../../../lib/game';
import { log } from '../../../../lib/log-bus';
import './HomeTab.css';

function formatRelativeTime(ts: number | undefined): string {
  if (!ts) return 'Never';
  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(ts).toLocaleDateString();
}

interface HomeTabProps {
  profileId: string;
  romFile: string;
  isGameRunning: boolean;
  onStartGame: () => void;
  lastPlayed?: number;
  created?: number;
  windowMode?: string;
}

interface SlotInfo {
  slot: number;
  timestamp: number | null;
  screenshot: string | null;
}

export const HomeTab = (props: HomeTabProps) => {
  const {
    profileId,
    romFile,
    isGameRunning,
    onStartGame,
    lastPlayed,
    created,
    windowMode,
  } = props; {
  const [slots, setSlots] = useState<SlotInfo[]>(() =>
    Array.from({ length: 10 }, (_, i) => ({ slot: i, timestamp: null, screenshot: null }))
  );
  const [sessions, setSessions] = useState<PlaySession[]>([]);
  const [busySlot, setBusySlot] = useState<number | null>(null);

  useEffect(() => {
    loadSlots();
    loadSessions();
  }, [profileId]);

  async function loadSlots() {
    try {
      const infos = await window.api.getSlotInfos(profileId);
      const loaded: SlotInfo[] = [];
      for (let i = 0; i < 10; i++) {
        const info = infos?.find((s: { slot: number }) => s.slot === i);
        let screenshot: string | null = null;
        if (info?.hasScreenshot) {
          try {
            const b64 = await window.api.readScreenshot(profileId, i);
            if (b64) {
              screenshot = `data:image/png;base64,${b64}`;
            }
          } catch { /* ignore */ }
        }
        loaded.push({
          slot: i,
          timestamp: info?.timestamp ?? null,
          screenshot,
        });
      }
      setSlots(loaded);
    } catch { /* ignore */ }
  }

  async function loadSessions() {
    const list = await listSessions(profileId);
    setSessions(list.slice(0, 20));
  }

  const handleSave = useCallback(async (slot: number) => {
    setBusySlot(slot);
    log.app(`Saving state to slot ${slot + 1}`);
    await saveState(slot);
    await loadSlots();
    setBusySlot(null);
  }, [profileId]);

  const handleLoad = useCallback(async (slot: number) => {
    setBusySlot(slot);
    log.app(`Loading state from slot ${slot + 1}`);

    if (!isGameRunning) {
      // Start the game first, then load once it's running
      onStartGame();
      await new Promise<void>((resolve) => {
        const unsub = subscribeGameState((state) => {
          if (state.status === 'running') {
            unsub();
            resolve();
          } else if (state.status === 'error' || state.status === 'idle') {
            unsub();
            resolve();
          }
        });
      });
    }

    await loadState(slot);
    setBusySlot(null);
  }, [profileId, isGameRunning, onStartGame]);

  return (
    <div className="home-tab">
      <div className="home-tab__info-cards">
        <div className="home-tab__info-card">
          <span className="home-tab__info-label">ROM</span>
          <span className="home-tab__info-value">{romFile.replace(/\.(sfc|smc)$/i, '')}</span>
        </div>
        <div className="home-tab__info-card">
          <span className="home-tab__info-label">Last Played</span>
          <span className="home-tab__info-value">{formatRelativeTime(lastPlayed)}</span>
        </div>
        <div className="home-tab__info-card">
          <span className="home-tab__info-label">Created</span>
          <span className="home-tab__info-value">{formatRelativeTime(created)}</span>
        </div>
        {windowMode && (
          <div className="home-tab__info-card">
            <span className="home-tab__info-label">Window</span>
            <span className="home-tab__info-value" style={{ textTransform: 'capitalize' }}>{windowMode}</span>
          </div>
        )}
      </div>

      <section className="home-tab__section">
        <h3 className="home-tab__section-title">Save States</h3>
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
              onSave={handleSave}
              onLoad={handleLoad}
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
  );
}
