/**
 * RegionEditorDialog — Wizard for creating/editing screen definitions.
 *
 * Step 1: Edit screen fields (pre-filled from game state + existing data)
 * Step 2: Preview generated TS code
 */

import { useState, useMemo, useEffect } from 'react';
import { Button, Badge, TextInput, Select } from '../../components/primitives';
import type { SelectOption } from '../../components/primitives';
import type { ScreenDefinition, ScreenType } from '@shared/game/types';
import type { RegionTag } from '@shared/game/data/regions/tags';
import { TAG_METADATA } from '@shared/game/data/regions/tags';
import { serializeScreen, resolveScreenFile, DUNGEON_FILE_MAP } from '@shared/game/data/region-codegen';
import type { ScreenCodegenInput } from '@shared/game/data/region-codegen';
import { PALACE_INDEX_NAMES, DUNGEON_PALACE_VALUES } from '@shared/game/data/regions/game-values';
import './RegionEditorDialog.css';

interface RegionEditorDialogProps {
  open: boolean;
  onClose: () => void;
  /** Existing screen (edit mode) or null (create mode) */
  existingRegion: ScreenDefinition | null;
  /** Game state for pre-filling */
  gameState: {
    roomIndex: number;
    palaceIndex: number;
    isIndoors: boolean;
    isDarkWorld: boolean;
  };
}

type ScreenTypeValue = ScreenType;

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'dungeon', label: 'Dungeon' },
  { value: 'interior', label: 'Interior (cave, house, shop)' },
  { value: 'overworld', label: 'Overworld' },
];

/** Palace-derived dungeon options from the canonical game values map */
const DUNGEON_OPTIONS: SelectOption[] = Object.keys(DUNGEON_PALACE_VALUES).map(d => ({ value: d, label: d }));

/** Palace index dropdown — shows actual runtime values */
const PALACE_OPTIONS: SelectOption[] = Object.entries(PALACE_INDEX_NAMES)
  .filter(([k]) => Number(k) !== 0xFF)
  .map(([value, label]) => ({ value, label: `0x${Number(value).toString(16).toUpperCase().padStart(2, '0')} — ${label}` }));

function RegionEditorDialog({ open, onClose, existingRegion, gameState }: RegionEditorDialogProps) {
  const [step, setStep] = useState(0);

  // Form state
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<ScreenTypeValue>('dungeon');
  const [indoor, setIndoor] = useState(true);
  const [darkWorld, setDarkWorld] = useState(false);
  const [location, setLocation] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [dungeon, setDungeon] = useState('');
  const [palaceIdx, setPalaceIdx] = useState('');
  const [floor, setFloor] = useState('');
  const [gridX, setGridX] = useState('');
  const [gridY, setGridY] = useState('');
  const [selectedTags, setSelectedTags] = useState<RegionTag[]>([]);
  const [checks, setChecks] = useState('');
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);

  // Pre-fill on open
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setWriteError(null);

    if (existingRegion) {
      setId(existingRegion.id);
      setName(existingRegion.name);
      setType(existingRegion.type);
      setIndoor(existingRegion.type !== 'overworld');
      setDarkWorld(existingRegion.world === 'dark');
      setLocation(existingRegion.location);
      setSubtitle('');
      setDungeon(existingRegion.type === 'dungeon' ? existingRegion.dungeon.name : '');
      const pi = existingRegion.type === 'dungeon' ? existingRegion.dungeon.palaceIndex : undefined;
      setPalaceIdx(pi != null ? String(pi) : '');
      setFloor(existingRegion.type === 'dungeon' && existingRegion.dungeon.floor != null ? String(existingRegion.dungeon.floor) : '');
      setGridX(existingRegion.type === 'dungeon' && existingRegion.dungeon.gridX != null ? String(existingRegion.dungeon.gridX) : existingRegion.type === 'overworld' ? String(existingRegion.overworld.gridX) : '');
      setGridY(existingRegion.type === 'dungeon' && existingRegion.dungeon.gridY != null ? String(existingRegion.dungeon.gridY) : existingRegion.type === 'overworld' ? String(existingRegion.overworld.gridY) : '');
      setSelectedTags([...existingRegion.tags]);
      setChecks('');
    } else {
      // Auto-generate from game state
      const hex = gameState.roomIndex.toString(16).padStart(2, '0');
      const isDungeon = gameState.palaceIndex <= 0x1A;
      const prefix = isDungeon ? getDungeonPrefix(gameState.palaceIndex) : 'room';
      setId(`${prefix}-0x${hex}`);
      setName('');
      setType(isDungeon ? 'dungeon' : 'interior');
      setIndoor(gameState.isIndoors);
      setDarkWorld(gameState.isDarkWorld);
      // Derive location from palace index
      const dungeonName = PALACE_INDEX_NAMES[gameState.palaceIndex]?.replace(/ \(.*\)$/, '') ?? '';
      setLocation(dungeonName);
      setSubtitle('');
      setDungeon(dungeonName);
      setPalaceIdx(isDungeon ? String(gameState.palaceIndex) : '');
      setFloor('');
      setGridX('');
      setGridY('');
      setSelectedTags(gameState.isDarkWorld ? ['world:dark'] : ['world:light']);
      setChecks('');
    }
  }, [open, existingRegion, gameState]);

  const roomIndex = gameState.roomIndex;

  // Build the codegen input
  const codegenInput = useMemo((): ScreenCodegenInput => ({
    id,
    name,
    type,
    world: darkWorld ? 'dark' : 'light',
    location,
    area: location, // derive from tags later
    roomIndex,
    overworld: type === 'overworld' ? { gridX: gridX ? Number(gridX) : 0, gridY: gridY ? Number(gridY) : 0 } : undefined,
    dungeon: type === 'dungeon' ? { name: dungeon, palaceIndex: palaceIdx ? Number(palaceIdx) : undefined, floor: floor ? Number(floor) : undefined, gridX: gridX ? Number(gridX) : undefined, gridY: gridY ? Number(gridY) : undefined } : undefined,
    interior: type === 'interior' ? { kind: 'cave' } : undefined,
    tags: selectedTags,
  }), [id, name, type, darkWorld, roomIndex, palaceIdx, location, dungeon, gridX, gridY, floor, selectedTags]);

  const generatedCode = useMemo(() => serializeScreen(codegenInput), [codegenInput]);
  const targetFile = useMemo(() => resolveScreenFile(codegenInput), [codegenInput]);

  const toggleTag = (tag: RegionTag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };

  const handleWrite = async () => {
    setWriting(true);
    setWriteError(null);
    try {
      const result = await window.api.regionEditor.writeRegion({
        filePath: targetFile.relativePath,
        code: generatedCode,
        regionId: existingRegion?.id ?? null,
      });
      if (!result.success) {
        setWriteError(result.error ?? 'Unknown error');
      } else {
        onClose();
      }
    } catch (e: unknown) {
      setWriteError(e instanceof Error ? e.message : 'Write failed');
    } finally {
      setWriting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="region-editor-backdrop" onClick={onClose}>
      <div className="region-editor" onClick={e => e.stopPropagation()}>
        <div className="region-editor__header">
          <h3>{existingRegion ? 'Edit Screen' : 'Create Screen'}</h3>
          <Badge variant={existingRegion ? 'success' : 'warning'}>
            {existingRegion ? 'Editing' : 'New'}
          </Badge>
          <span className="region-editor__room-id">
            Room 0x{roomIndex.toString(16).toUpperCase()}
          </span>
        </div>

        {/* Step indicator */}
        <div className="region-editor__steps">
          <button className={step === 0 ? 'active' : ''} onClick={() => setStep(0)}>1. Fields</button>
          <button className={step === 1 ? 'active' : ''} onClick={() => setStep(1)}>2. Preview</button>
        </div>

        {/* Step 1: Fields */}
        {step === 0 && (
          <div className="region-editor__form">
            <div className="region-editor__row">
              <label>ID</label>
              <TextInput value={id} onChange={setId} placeholder="e.g. hc-0x51" />
            </div>
            <div className="region-editor__row">
              <label>Name</label>
              <TextInput value={name} onChange={setName} placeholder="Screen name" />
            </div>
            <div className="region-editor__row">
              <label>Type</label>
              <Select options={TYPE_OPTIONS} value={type} onChange={v => setType(v as ScreenTypeValue)} />
            </div>
            <div className="region-editor__row">
              <label>Location (group)</label>
              <TextInput value={location} onChange={setLocation} placeholder="Parent location name" />
            </div>
            {type === 'dungeon' && (
              <>
                <div className="region-editor__row">
                  <label>Dungeon</label>
                  <Select options={DUNGEON_OPTIONS} value={dungeon} onChange={setDungeon} />
                </div>
                <div className="region-editor__row">
                  <label>Palace Index</label>
                  <Select options={PALACE_OPTIONS} value={palaceIdx} onChange={setPalaceIdx} />
                </div>
              </>
            )}
            <div className="region-editor__row">
              <label>
                <input type="checkbox" checked={darkWorld} onChange={e => setDarkWorld(e.target.checked)} />
                {' '}Dark World
              </label>
            </div>
            <div className="region-editor__row">
              <label>Subtitle</label>
              <TextInput value={subtitle} onChange={setSubtitle} placeholder="e.g. 1F, Basement B2" />
            </div>
            <div className="region-editor__row region-editor__row--half">
              <div>
                <label>Floor</label>
                <TextInput value={floor} onChange={setFloor} placeholder="-1, 0, 1..." />
              </div>
              <div>
                <label>Grid X, Y</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <TextInput value={gridX} onChange={setGridX} placeholder="X" />
                  <TextInput value={gridY} onChange={setGridY} placeholder="Y" />
                </div>
              </div>
            </div>
            <div className="region-editor__row">
              <label>Checks (comma-separated IDs)</label>
              <TextInput value={checks} onChange={setChecks} placeholder="check-id-1, check-id-2" />
            </div>

            {/* Tags by namespace */}
            <div className="region-editor__tags">
              <label>Tags</label>
              {(['world', 'env', 'type', 'area', 'dungeon', 'role'] as const).map(ns => (
                <div key={ns} className="region-editor__tag-group">
                  <span className="region-editor__tag-ns">{ns}</span>
                  {TAG_METADATA.filter(t => t.namespace === ns).map(t => (
                    <button
                      key={t.id}
                      className={`region-editor__tag ${selectedTags.includes(t.id) ? 'active' : ''}`}
                      onClick={() => toggleTag(t.id)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 1 && (
          <div className="region-editor__preview">
            <div className="region-editor__file-target">
              <span>Target: </span>
              <code>{targetFile.relativePath}</code>
            </div>
            <pre className="region-editor__code">{generatedCode}</pre>
            {writeError && <p className="region-editor__error">{writeError}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="region-editor__actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          {step === 0 && (
            <Button variant="primary" onClick={() => setStep(1)}>Preview →</Button>
          )}
          {step === 1 && (
            <>
              <Button variant="secondary" onClick={() => setStep(0)}>← Back</Button>
              <Button variant="primary" onClick={handleWrite} disabled={writing}>
                {writing ? 'Writing...' : 'Accept & Write'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───

function getDungeonPrefix(palaceIndex: number): string {
  const map: Record<number, string> = {
    0x00: 'hc', 0x02: 'hc', 0x04: 'ep', 0x06: 'dp', 0x08: 'th',
    0x0A: 'pod', 0x0C: 'sp', 0x0E: 'sw', 0x10: 'tt',
    0x12: 'ip', 0x14: 'mm', 0x16: 'tr', 0x18: 'gt', 0x1A: 'ct',
  };
  return map[palaceIndex] ?? 'room';
}

export { RegionEditorDialog };
