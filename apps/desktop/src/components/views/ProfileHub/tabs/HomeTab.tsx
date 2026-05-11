import { useState, useEffect } from 'react';
import type { PlaySession } from '@shared/types/session';
import { Button } from '../../../primitives/Button';
import { SaveStateCard } from '../../../compounds/SaveStateCard';
import { PlaySessionCard } from '../../../compounds/PlaySessionCard';
import { listSessions } from '../../../../lib/game/session-tracker';
import './HomeTab.css';

interface HomeTabProps {
  profileId: string;
  profileName: string;
  romFile: string;
  isGameRunning: boolean;
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
}

interface SlotInfo {
  slot: number;
  timestamp: number | null;
  screenshot: string | null;
}

export function HomeTab({
  profileId,
  profileName,
  romFile,
  isGameRunning,
  onStartGame,
  onStopGame,
  onResetGame,
}: HomeTabProps) {
  const [slots, setSlots] = useState<SlotInfo[]>(() =>
    Array.from({ length: 10 }, (_, i) => ({ slot: i, timestamp: null, screenshot: null }))
  );
  const [sessions, setSessions] = useState<PlaySession[]>([]);

  useEffect(() => {
    loadSlots();
    loadSessions();
  }, [profileId]);

  async function loadSlots() {
    try {
      const infos = await window.api.getSlotInfos(profileId);
      const loaded: SlotInfo[] = [];
      for (let i = 0; i < 10; i++) {
        const info = infos?.[i];
        let screenshot: string | null = null;
        if (info?.hasScreenshot) {
          try {
            const buf = await window.api.readScreenshot(profileId, i);
            if (buf) {
              const blob = new Blob([buf], { type: 'image/png' });
              screenshot = URL.createObjectURL(blob);
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

  return (
    <div className="home-tab">
      <div className="home-tab__header">
        <div className="home-tab__profile-info">
          <span className="home-tab__name">{profileName}</span>
          <span className="home-tab__rom">{romFile.replace(/\.(sfc|smc)$/i, '')}</span>
        </div>
        <div className="home-tab__actions">
          {!isGameRunning ? (
            <Button variant="primary" size="md" onClick={onStartGame}>▶ Play</Button>
          ) : (
            <>
              <Button variant="danger" size="md" onClick={onStopGame}>■ Stop</Button>
              <Button variant="secondary" size="md" onClick={onResetGame}>↻ Reset</Button>
            </>
          )}
        </div>
      </div>

      <section className="home-tab__section">
        <h3 className="home-tab__section-title">Save States</h3>
        <div className="home-tab__save-grid">
          {slots.map((s) => (
            <SaveStateCard key={s.slot} slot={s.slot} screenshot={s.screenshot} timestamp={s.timestamp} />
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
