import { useState, useEffect, useCallback, useMemo } from 'react';
import { ImportForm } from './ImportForm';
import { IconButton } from '../../primitives/IconButton';
import { Select } from '../../primitives/Select';
import type { SelectOption } from '../../primitives/Select';

interface MsuPack {
  name: string;
  fileCount: number;
  totalSize: number;
}

interface MsuFile {
  name: string;
  size: number;
}

interface TrackInfo {
  fileName: string;
  trackNum: number;
  ext: string;
}

// ─── ALttP MSU-1 Track Descriptions ───
// Standard tracks (1-36) + Deluxe tracks (37-112)
const MSU_TRACK_DESCRIPTIONS: Record<number, string> = {
  // Standard MSU-1
  1: 'Opening Theme',
  2: 'Light World',
  3: 'Rain State',
  4: 'Bunny',
  5: 'Lost Woods',
  6: 'Prologue',
  7: 'Kakariko Village',
  8: 'Mirror / Portal',
  9: 'Dark World',
  10: 'Master Sword',
  11: 'File Select',
  12: 'Guard Encounter',
  13: 'Dark Death Mountain',
  14: 'Fortune Teller',
  15: 'Skull Woods (OW)',
  16: 'Hyrule Castle',
  17: 'Pendant Dungeon',
  18: 'Crystal Dungeon',
  19: 'Boss Clear',
  20: 'Sanctuary',
  21: 'Boss Battle',
  22: 'Agahnim Battle',
  23: 'Ganon Battle',
  24: 'Triforce Room',
  25: 'Ending Sequence',
  26: 'Credits',
  27: 'Eastern Palace',
  28: 'Desert Palace',
  29: "Agahnim's Tower",
  30: 'Swamp Palace',
  31: 'Palace of Darkness',
  32: 'Misery Mire',
  33: 'Skull Woods (Dungeon)',
  34: 'Ice Palace',
  35: 'Tower of Hera',
  36: "Thieves' Town",
  // Deluxe — Overworld context
  37: 'LW: Hyrule Field',
  38: 'LW: Castle Grounds',
  39: 'LW: Kakariko Area',
  40: 'LW: Eastern Area',
  41: 'LW: Southern Shore',
  42: 'LW: Forest / Woods',
  43: 'DW: Dark Forest',
  44: 'DW: Mire Area',
  45: 'DW: Mountain',
  46: 'DW: Swamp',
  47: 'DW: Graveyard',
  48: 'DW: Sacred Grove',
  49: 'DW: Pyramid',
  50: 'DW: Village',
  51: 'DW: Dark Woods',
  52: 'DW: Death Mountain',
  53: 'DW: Ice Lake',
  54: 'DW: Skeleton Forest',
  55: 'DW: Bumper Area',
  56: 'DW: Dark Palace Area',
  57: 'DW: Dark Desert',
  58: 'DW: Turtle Rock Area',
  // Deluxe — Dungeons / Interiors
  59: "Link's House",
  60: "Zelda's Cell",
  61: 'Castle Interior',
  62: 'Generic Interior',
  63: 'Castle Dungeon',
  64: 'Church Interior',
  65: 'Tavern',
  66: "Sahasrahla's Hut",
  67: 'Fairy Fountain',
  68: 'Cave',
  69: "Blind's Hideout",
  70: 'Desert Palace Interior',
  71: 'Swamp Palace Interior',
  72: 'Palace of Darkness Int.',
  73: 'Ice Palace Interior',
  74: 'Tower of Hera Interior',
  75: 'Misery Mire Interior',
  76: "Thieves' Town Interior",
  77: 'Skull Woods Interior',
  78: "Ganon's Tower Interior",
  79: 'Turtle Rock Interior',
  80: 'Eastern Palace Interior',
  81: "Agahnim's Tower Int.",
  82: 'Castle Tower',
  83: 'Mountain Cave',
  84: 'Checkerboard Cave',
  85: 'Hammer Peg Cave',
  86: 'Chest Game',
  87: 'Bumper Cave',
  88: 'Spike Cave',
  89: 'Hookshot Cave',
  90: 'Mimic Cave',
  91: 'Superbunny Cave',
  92: 'Paradox Cave',
  93: 'Spectacle Rock Cave',
  94: 'Waterfall of Wishing',
  95: 'Pyramid Fairy',
  96: 'Dark Chapel',
  97: "King's Tomb",
  98: 'Graveyard Cave',
  99: 'Dam',
  100: 'Sewers',
  102: 'Potion Shop',
  103: 'Witch Hut',
  104: 'Library',
  105: 'Treasure Chest Game',
  106: 'Archery Game',
  107: 'Digging Game',
  108: 'Lumberjack House',
  109: 'Fortune Teller (DW)',
  110: 'DW: Shop Area',
  112: 'LW: Desert',
  114: 'Bomb Shop',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTrackNumber(filename: string): number | null {
  const match = filename.match(/(\d+)\.(pcm|opuz)$/i);
  return match ? parseInt(match[1], 10) : null;
}

interface MsuManagerProps {
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onRefresh: () => void;
}

export function MsuManager({ onDeleteConfirm, onRefresh }: MsuManagerProps) {
  const [packs, setPacks] = useState<MsuPack[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [files, setFiles] = useState<MsuFile[]>([]);
  const [trackInfos, setTrackInfos] = useState<TrackInfo[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [newPackName, setNewPackName] = useState('');

  const refresh = useCallback(async () => {
    const list = await window.api.listMsuPacks();
    setPacks(list);
    onRefresh();
  }, [onRefresh]);

  useEffect(() => { refresh(); }, [refresh]);

  // Load pack files + track info when selection changes
  useEffect(() => {
    if (!selected) { setFiles([]); setTrackInfos([]); return; }
    setLoadingFiles(true);
    Promise.all([
      window.api.getMsuPackFiles(selected),
      window.api.getMsuTrackList(selected),
    ]).then(([fileList, tracks]) => {
      setFiles(fileList.sort((a, b) => {
        const na = getTrackNumber(a.name) ?? 999;
        const nb = getTrackNumber(b.name) ?? 999;
        return na - nb;
      }));
      setTrackInfos(tracks.sort((a, b) => a.trackNum - b.trackNum));
      setLoadingFiles(false);
    });
  }, [selected]);

  // ─── Track mapping ───
  // Build default mapping: trackNum → fileName (auto-matched by number)
  const [trackMapping, setTrackMapping] = useState<Record<number, string>>({});

  useEffect(() => {
    const mapping: Record<number, string> = {};
    for (const t of trackInfos) {
      mapping[t.trackNum] = t.fileName;
    }
    setTrackMapping(mapping);
  }, [trackInfos]);

  // All available file options for the dropdown
  const fileOptions: SelectOption[] = useMemo(() => [
    { value: '', label: '(none)' },
    ...trackInfos.map((t) => ({
      value: t.fileName,
      label: `#${t.trackNum} — ${t.fileName}`,
      description: formatBytes(files.find((f) => f.name === t.fileName)?.size ?? 0),
    })),
  ], [trackInfos, files]);

  // Detect pack type
  const isDeluxe = useMemo(() => trackInfos.some((t) => t.trackNum >= 37), [trackInfos]);
  const hasOpuz = useMemo(() => trackInfos.some((t) => t.ext === 'opuz'), [trackInfos]);

  // Separate matched and unmatched tracks
  const { matchedTracks, unmatchedFiles } = useMemo(() => {
    const assignedFiles = new Set(Object.values(trackMapping).filter(Boolean));
    const matched: { trackNum: number; description: string; fileName: string | null }[] = [];

    // All known track numbers that have descriptions AND are present
    const allTrackNums = Object.keys(MSU_TRACK_DESCRIPTIONS).map(Number).sort((a, b) => a - b);
    for (const num of allTrackNums) {
      const fileName = trackMapping[num] ?? null;
      if (fileName || trackInfos.some((t) => t.trackNum === num)) {
        matched.push({
          trackNum: num,
          description: MSU_TRACK_DESCRIPTIONS[num] ?? `Track ${num}`,
          fileName,
        });
      }
    }

    // Tracks present in pack but without a description
    for (const t of trackInfos) {
      if (!MSU_TRACK_DESCRIPTIONS[t.trackNum] && !matched.some((m) => m.trackNum === t.trackNum)) {
        matched.push({
          trackNum: t.trackNum,
          description: `Track ${t.trackNum}`,
          fileName: trackMapping[t.trackNum] ?? t.fileName,
        });
      }
    }
    matched.sort((a, b) => a.trackNum - b.trackNum);

    // Files not assigned to any track
    const unmatched = trackInfos.filter((t) => !assignedFiles.has(t.fileName));

    return { matchedTracks: matched, unmatchedFiles: unmatched };
  }, [trackMapping, trackInfos]);

  const handleTrackAssign = useCallback((trackNum: number, fileName: string) => {
    setTrackMapping((prev) => ({ ...prev, [trackNum]: fileName }));
  }, []);

  const handleUrlImport = useCallback(async (url: string) => {
    const packName = newPackName.trim() || `pack-${Date.now()}`;
    const result = await window.api.importMsu(packName, url);
    if (result.success) {
      await refresh();
      setSelected(packName);
      setNewPackName('');
      return { success: true, message: `Imported ${result.fileCount ?? 0} MSU files` };
    }
    return { success: false, message: result.error ?? 'Download failed' };
  }, [newPackName, refresh]);

  const handleFileImport = useCallback(async (importFiles: File[]) => {
    if (importFiles.length === 0) return { success: false, message: 'No file selected' };
    const filePath = window.api.getFilePath(importFiles[0]);
    if (!filePath) return { success: false, message: 'Could not read file path' };
    const packName = newPackName.trim() || `pack-${Date.now()}`;
    const result = await window.api.importMsuFile(packName, filePath);
    if (result.success) {
      await refresh();
      setSelected(packName);
      setNewPackName('');
      return { success: true, message: `Imported ${result.fileCount ?? 0} MSU files` };
    }
    return { success: false, message: result.error ?? 'Import failed' };
  }, [newPackName, refresh]);

  const handleDelete = useCallback((packName: string) => {
    onDeleteConfirm('Delete MSU Pack', `Delete MSU pack "${packName}"? This cannot be undone.`, async () => {
      await window.api.deleteMsuPack(packName);
      if (selected === packName) { setSelected(null); setFiles([]); setTrackInfos([]); }
      await refresh();
    });
  }, [selected, refresh, onDeleteConfirm]);

  // Group matched tracks into standard / deluxe sections
  const standardTracks = matchedTracks.filter((t) => t.trackNum <= 36);
  const deluxeTracks = matchedTracks.filter((t) => t.trackNum > 36);

  return (
    <div className="data-columns">
      <div className="data-columns__left">
        <div className="import-form">
          <div className="profile-form__field">
            <span className="profile-form__label">Pack Name</span>
            <input
              className="profile-form__input"
              type="text"
              placeholder="My MSU Pack"
              value={newPackName}
              onChange={(e) => setNewPackName(e.target.value)}
            />
          </div>
        </div>
        <ImportForm
          placeholder="Paste MSU pack download URL…"
          accept={['.zip', '.7z', '.rar']}
          dropLabel="Drop MSU pack here"
          dropHint=".zip, .7z, or .rar archive"
          onUrlImport={handleUrlImport}
          onFileImport={handleFileImport}
        />

        <div className="data-list">
          {packs.length === 0 && (
            <div className="data-list-empty" style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
              No MSU packs imported yet
            </div>
          )}
          {packs.map((pack) => (
            <div
              key={pack.name}
              className={`data-list-item ${selected === pack.name ? 'data-list-item--selected' : ''}`}
              onClick={() => setSelected(pack.name)}
            >
              <span className="data-list-item__icon">🎵</span>
              <div className="data-list-item__info">
                <div className="data-list-item__name">{pack.name}</div>
                <div className="data-list-item__meta">
                  {pack.fileCount} track{pack.fileCount !== 1 ? 's' : ''} · {formatBytes(pack.totalSize)}
                </div>
              </div>
              <div className="data-list-item__action">
                <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(pack.name); }}>
                  ✕
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`data-columns__right ${!selected ? 'data-columns__right--empty' : ''}`}>
        {!selected ? (
          <span>Select an MSU pack to view tracks</span>
        ) : loadingFiles ? (
          <span>Loading…</span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 className="detail-panel__title">{selected}</h3>
            <div className="detail-panel__grid" style={{ marginBottom: 'var(--space-md)' }}>
              <span className="detail-panel__label">Tracks</span>
              <span className="detail-panel__value">{trackInfos.length}</span>
              <span className="detail-panel__label">Total Size</span>
              <span className="detail-panel__value">{formatBytes(files.reduce((s, f) => s + f.size, 0))}</span>
              <span className="detail-panel__label">Type</span>
              <span className="detail-panel__value">
                {isDeluxe ? 'Deluxe' : 'Standard'}
                {hasOpuz ? ' (Opus)' : ' (PCM)'}
              </span>
            </div>

            {/* Standard tracks section */}
            {standardTracks.length > 0 && (
              <div className="detail-panel__section">
                <h4 className="detail-panel__section-title">Standard Tracks</h4>
                <div className="track-list">
                  {standardTracks.map((track) => (
                    <TrackRow
                      key={track.trackNum}
                      trackNum={track.trackNum}
                      description={track.description}
                      fileName={track.fileName}
                      fileSize={files.find((f) => f.name === track.fileName)?.size}
                      options={fileOptions}
                      onAssign={handleTrackAssign}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Deluxe tracks section */}
            {deluxeTracks.length > 0 && (
              <div className="detail-panel__section">
                <h4 className="detail-panel__section-title">Deluxe Tracks</h4>
                <div className="track-list">
                  {deluxeTracks.map((track) => (
                    <TrackRow
                      key={track.trackNum}
                      trackNum={track.trackNum}
                      description={track.description}
                      fileName={track.fileName}
                      fileSize={files.find((f) => f.name === track.fileName)?.size}
                      options={fileOptions}
                      onAssign={handleTrackAssign}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Unmatched files section */}
            {unmatchedFiles.length > 0 && (
              <div className="detail-panel__section">
                <h4 className="detail-panel__section-title" style={{ color: 'var(--color-text-muted)' }}>
                  Unmatched Files ({unmatchedFiles.length})
                </h4>
                <div className="track-list">
                  {unmatchedFiles.map((f) => (
                    <div key={f.fileName} className="track-list__item">
                      <span className="track-list__num" style={{ color: 'var(--color-text-faint)' }}>—</span>
                      <span className="track-list__name" style={{ color: 'var(--color-text-muted)' }}>{f.fileName}</span>
                      <span className="track-list__size">
                        {formatBytes(files.find((file) => file.name === f.fileName)?.size ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Individual track row with editable mapping ───
function TrackRow({
  trackNum,
  description,
  fileName,
  fileSize,
  options,
  onAssign,
}: {
  trackNum: number;
  description: string;
  fileName: string | null;
  fileSize?: number;
  options: SelectOption[];
  onAssign: (trackNum: number, fileName: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="track-list__item">
      <span className="track-list__num">#{trackNum}</span>
      <span className="track-list__name">{description}</span>
      {editing ? (
        <div style={{ minWidth: 200, maxWidth: 280 }}>
          <Select
            value={fileName ?? ''}
            onChange={(val) => { onAssign(trackNum, val); setEditing(false); }}
            options={options}
            placeholder="Select file…"
            searchable
            size="sm"
          />
        </div>
      ) : (
        <>
          <span
            className="track-list__file"
            style={{
              color: fileName ? 'var(--color-text-secondary)' : 'var(--color-text-faint)',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              flex: '0 0 auto',
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={fileName ?? 'Click to assign'}
            onClick={() => setEditing(true)}
          >
            {fileName ? fileName : '—'}
          </span>
          {fileSize != null && (
            <span className="track-list__size">{formatBytes(fileSize)}</span>
          )}
        </>
      )}
    </div>
  );
}
