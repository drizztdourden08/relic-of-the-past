/**
 * NavigationWidgetContent — "Location & Navigation" widget.
 *
 * Shows current overworld location info + connections with review controls.
 * Triggers flood-fill analysis and drives the in-game overlay.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameUIStore } from '../../stores/game-ui-store';
import { useConnectionOverlayStore } from '../../stores/connection-overlay-store';
import { SCREEN_NAMES } from '@shared/game/navigation';
import { wasmGetViewportInfo } from '../../lib/game';
import type { FloodFillResult, ConnectionInfo } from '@shared/game/navigation';

type ReviewStatus = 'neutral' | 'good' | 'bad' | 'yellow';
interface ReviewEntry { status: ReviewStatus; comment?: string; }
interface LocationReview { status: ReviewStatus; comment?: string; connections: Record<string, ReviewEntry>; }
type ReviewData = Record<string, LocationReview>;

const EDGE_COLORS: Record<string, string> = {
  north: '#4488ff', south: '#44ff88', east: '#ff8844', west: '#bb44ff', entrance: '#ffcc44',
};
const EDGE_ARROWS: Record<string, string> = {
  north: '⬆', south: '⬇', east: '➡', west: '⬅',
};
const STATUS_BTNS: { key: ReviewStatus; label: string; color: string }[] = [
  { key: 'neutral', label: '—', color: '#666' },
  { key: 'good', label: '✓', color: '#4c4' },
  { key: 'bad', label: '✗', color: '#f44' },
  { key: 'yellow', label: '⚠', color: '#fc4' },
];

function NavigationWidgetContent({ romFile }: { romFile: string }) {
  const { overworldScreenIndex, isIndoors, isDarkWorld } = useGameUIStore(s => s.map);
  const equipment = useGameUIStore(s => s.equipment);
  const overlayStore = useConnectionOverlayStore();
  const [reviewData, setReviewData] = useState<ReviewData>({});
  const [result, setResult] = useState<FloodFillResult | null>(null);
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [running, setRunning] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load review data
  useEffect(() => {
    window.api.loadConnectionReview().then((d: unknown) => setReviewData((d ?? {}) as ReviewData));
  }, []);

  const persist = useCallback((next: ReviewData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => window.api.saveConnectionReview(next), 300);
  }, []);

  const locationKey = `${isDarkWorld ? 'dw' : 'lw'}-${overworldScreenIndex.toString(16).padStart(2, '0')}`;
  const screenName = SCREEN_NAMES[overworldScreenIndex] ?? `Screen 0x${overworldScreenIndex.toString(16).toUpperCase()}`;
  const locationReview = reviewData[locationKey] ?? { status: 'neutral' as ReviewStatus, connections: {} };

  // Clear overlay when screen changes
  useEffect(() => {
    if (result && result.screenIndex !== overworldScreenIndex) {
      setResult(null);
      setConnections([]);
      overlayStore.clear();
    }
  }, [overworldScreenIndex]);

  // Run flood fill
  const handleRun = useCallback(async () => {
    if (!romFile || isIndoors || running) return;
    setRunning(true);
    try {
      // Build inventory from current equipment state
      // lift.1=always (bushes/light stones, Link has from start), lift.2=Titan's Mitt (dark rocks)
      const items: string[] = ['lift.1'];
      if (equipment.gloves >= 2) items.push('lift.2');
      if (equipment.boots) items.push('boots');
      if (equipment.flippers) items.push('flippers');

      const resp = await window.api.runFloodFill(romFile, overworldScreenIndex, items);
      if ('error' in resp) { console.error(resp.error); return; }
      const fillResult: FloodFillResult = {
        ...resp,
        reachable: resp.reachable.map((row: number[]) => row.map((v: number) => v === 1)),
        ledges: resp.ledges ?? [],
        attrGrid: resp.attrGrid,
      };
      setResult(fillResult);
      setConnections(resp.connections);
      overlayStore.setData(fillResult, resp.connections);
    } catch (e) { console.error(e); }
    finally { setRunning(false); }
  }, [romFile, overworldScreenIndex, isIndoors, running, equipment]);

  // Toggle overlay
  const toggleOverlay = useCallback(() => {
    if (overlayStore.visible) overlayStore.setVisible(false);
    else if (result) overlayStore.setData(result, connections);
  }, [result, connections]);

  // Review helpers
  const setLocStatus = (status: ReviewStatus) => {
    setReviewData(prev => {
      const entry = prev[locationKey] ?? { status: 'neutral', connections: {} };
      const next = { ...prev, [locationKey]: { ...entry, status } };
      persist(next);
      return next;
    });
  };
  const setLocComment = (comment: string) => {
    setReviewData(prev => {
      const entry = prev[locationKey] ?? { status: 'neutral' as ReviewStatus, connections: {} };
      const next = { ...prev, [locationKey]: { ...entry, comment } };
      persist(next);
      return next;
    });
  };
  const setConnStatus = (connKey: string, status: ReviewStatus) => {
    setReviewData(prev => {
      const loc = prev[locationKey] ?? { status: 'neutral' as ReviewStatus, connections: {} };
      const conn = loc.connections[connKey] ?? { status: 'neutral' };
      const next = { ...prev, [locationKey]: { ...loc, connections: { ...loc.connections, [connKey]: { ...conn, status } } } };
      persist(next);
      return next;
    });
  };
  const setConnComment = (connKey: string, comment: string) => {
    setReviewData(prev => {
      const loc = prev[locationKey] ?? { status: 'neutral' as ReviewStatus, connections: {} };
      const conn = loc.connections[connKey] ?? { status: 'neutral' as ReviewStatus };
      const next = { ...prev, [locationKey]: { ...loc, connections: { ...loc.connections, [connKey]: { ...conn, comment } } } };
      persist(next);
      return next;
    });
  };

  return (
    <div style={S.root}>
      {/* Location header */}
      <div style={S.section}>
        <div style={S.locName}>{screenName}</div>
        <div style={S.meta}>
          {locationKey} · {isDarkWorld ? 'DW' : 'LW'} · R{(overworldScreenIndex >> 3) & 7} C{overworldScreenIndex & 7}
          {isIndoors && ' · (indoors)'}
        </div>
        {result && (
          <div style={S.meta}>
            {result.reachableCount}/{result.totalTiles} reachable ({(result.reachableCount / result.totalTiles * 100).toFixed(0)}%)
            · {result.entrances.length} entrance{result.entrances.length !== 1 ? 's' : ''}
          </div>
        )}
        <StatusRow status={locationReview.status} comment={locationReview.comment} onStatus={setLocStatus} onComment={setLocComment} />
      </div>

      {/* Actions */}
      <div style={S.actions}>
        <button style={{ ...S.btn, ...(running || isIndoors ? S.btnDisabled : {}) }} onClick={handleRun} disabled={running || isIndoors || !romFile}>
          {running ? '⏳' : '▶'} Flood Fill
        </button>
        <button style={{ ...S.btn, ...(result ? {} : S.btnDisabled) }} onClick={toggleOverlay} disabled={!result}>
          {overlayStore.visible ? '👁 Hide' : '👁 Show'} Overlay
        </button>
      </div>

      {/* Tile Recorder */}
      <TileRecorder attrGrid={result?.attrGrid ?? null} overworldScreenIndex={overworldScreenIndex} />

      {/* Connections */}
      {connections.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Connections</div>
          {connections.map(conn => {
            const connKey = `${conn.edge}-${conn.targetScreen.toString(16)}`;
            const review = locationReview.connections[connKey] ?? { status: 'neutral' as ReviewStatus };
            const targetName = SCREEN_NAMES[conn.targetScreen] ?? `0x${conn.targetScreen.toString(16).toUpperCase()}`;
            return (
              <div key={connKey} style={S.connCard}>
                <div style={S.connHeader}>
                  <span style={{ ...S.dot, background: EDGE_COLORS[conn.edge] }} />
                  <span style={S.connTitle}>{EDGE_ARROWS[conn.edge]} {targetName}</span>
                </div>
                <div style={S.meta}>
                  {conn.freeTileCount} free{conn.itemTileCount > 0 ? ` + ${conn.itemTileCount} gated` : ''}
                  {conn.requirements.length > 0 && ` · ${conn.requirements.join(', ')}`}
                </div>
                <StatusRow status={review.status} comment={review.comment} onStatus={s => setConnStatus(connKey, s)} onComment={c => setConnComment(connKey, c)} />
              </div>
            );
          })}
        </div>
      )}

      {/* Entrances */}
      {result && result.entrances.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Entrances</div>
          {result.entrances.map(ent => {
            const connKey = `entrance-${ent.id}`;
            const review = locationReview.connections[connKey] ?? { status: 'neutral' as ReviewStatus };
            const t = result.transitions.find(t => t.entranceIdx === ent.id);
            return (
              <div key={connKey} style={S.connCard}>
                <div style={S.connHeader}>
                  <span style={{ ...S.dot, background: EDGE_COLORS.entrance }} />
                  <span style={S.connTitle}>Room 0x{ent.roomId.toString(16).toUpperCase()} (#{ent.id})</span>
                </div>
                <div style={S.meta}>
                  ({ent.gridRow},{ent.gridCol})
                  {t?.requirements.length ? ` · needs: ${t.requirements.join(', ')}` : ' · free'}
                </div>
                <StatusRow status={review.status} comment={review.comment} onStatus={s => setConnStatus(connKey, s)} onComment={c => setConnComment(connKey, c)} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── StatusRow ─────────────────────────────────────────────────────────

function StatusRow({ status, comment, onStatus, onComment }: { status: ReviewStatus; comment?: string; onStatus: (s: ReviewStatus) => void; onComment: (c: string) => void }) {
  return (
    <div>
      <div style={S.statusRow}>
        {STATUS_BTNS.map(b => (
          <button key={b.key} onClick={() => onStatus(b.key)} style={{ ...S.statusBtn, ...(status === b.key ? { color: b.color, borderColor: b.color } : {}) }}>
            {b.label}
          </button>
        ))}
      </div>
      {(status === 'bad' || status === 'yellow') && (
        <input style={S.commentInput} placeholder="Note..." value={comment ?? ''} onChange={e => onComment(e.target.value)} />
      )}
    </div>
  );
}

// ─── TileRecorder ──────────────────────────────────────────────────────

interface TileRecord { row: number; col: number; attr: number; }

function TileRecorder({ attrGrid, overworldScreenIndex }: { attrGrid: number[][] | null; overworldScreenIndex: number }) {
  const [recording, setRecording] = useState(false);
  const [tiles, setTiles] = useState<TileRecord[]>([]);
  const lastTile = useRef<string>('');
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!recording || !attrGrid) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const poll = () => {
      const vp = wasmGetViewportInfo();
      if (vp && vp.locationModule === 9) {
        // Link's position within this screen's grid
        const screenCol = overworldScreenIndex & 7;
        const screenRow = (overworldScreenIndex >> 3) & 7;
        const screenWorldX = screenCol * 512;
        const screenWorldY = screenRow * 512;

        const tileCol = Math.floor((vp.linkX - screenWorldX) / 8);
        const tileRow = Math.floor((vp.linkY - screenWorldY) / 8);

        if (tileRow >= 0 && tileRow < 64 && tileCol >= 0 && tileCol < 64) {
          const key = `${tileRow},${tileCol}`;
          if (key !== lastTile.current) {
            lastTile.current = key;
            const attr = attrGrid[tileRow][tileCol];
            setTiles(prev => [...prev, { row: tileRow, col: tileCol, attr }]);
          }
        }
      }
      rafRef.current = requestAnimationFrame(poll);
    };

    rafRef.current = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(rafRef.current);
  }, [recording, attrGrid, overworldScreenIndex]);

  const toggle = () => {
    if (recording) {
      setRecording(false);
    } else {
      setTiles([]);
      lastTile.current = '';
      setRecording(true);
    }
  };

  return (
    <div style={S.section}>
      <div style={S.sectionTitle}>Tile Recorder</div>
      <div style={S.actions}>
        <button style={{ ...S.btn, ...(attrGrid ? {} : S.btnDisabled) }} onClick={toggle} disabled={!attrGrid}>
          {recording ? '⏹ Stop' : '⏺ Record'}
        </button>
        {tiles.length > 0 && !recording && (
          <button style={S.btn} onClick={() => { navigator.clipboard.writeText(tiles.map(t => `[${t.row},${t.col}] 0x${t.attr.toString(16).padStart(2, '0')}`).join('\n')); }}>
            📋 Copy
          </button>
        )}
      </div>
      {tiles.length > 0 && (
        <div style={{ ...S.meta, maxHeight: 120, overflowY: 'auto', whiteSpace: 'pre', fontFamily: 'monospace', marginTop: 3 }}>
          {tiles.map((t, i) => (
            <div key={i} style={{ color: t.attr === 0x00 ? '#8f8' : t.attr === 0x01 ? '#f88' : '#ff8' }}>
              {i}: [{t.row},{t.col}] 0x{t.attr.toString(16).padStart(2, '0')}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  root: {
    background: 'rgba(0,0,0,0.8)',
    color: '#ccc',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    lineHeight: '14px',
    padding: '6px 8px',
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  section: { display: 'flex', flexDirection: 'column', gap: 3 },
  sectionTitle: { fontSize: 9, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1, paddingTop: 4 },
  locName: { fontSize: 12, fontWeight: 700, color: '#fff' },
  meta: { fontSize: 9, color: '#888' },
  actions: { display: 'flex', gap: 4 },
  btn: {
    padding: '3px 8px', background: 'rgba(100,200,100,0.12)', border: '1px solid rgba(100,200,100,0.35)',
    borderRadius: 3, color: '#8f8', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  },
  btnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  connCard: { display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 6px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', marginTop: 2 },
  connHeader: { display: 'flex', alignItems: 'center', gap: 5 },
  connTitle: { fontSize: 10, fontWeight: 600, color: '#ddd' },
  dot: { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },
  statusRow: { display: 'flex', gap: 3, marginTop: 3 },
  statusBtn: {
    padding: '1px 6px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 3,
    fontSize: 9, cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: '#888', fontFamily: 'inherit',
  },
  commentInput: {
    width: '100%', padding: '2px 6px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 3, color: '#ccc',
    fontSize: 9, fontFamily: 'inherit', outline: 'none', marginTop: 3,
  },
};

export { NavigationWidgetContent };
