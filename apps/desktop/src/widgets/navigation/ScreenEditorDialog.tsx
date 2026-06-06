/**
 * ScreenEditorDialog — Wizard for creating/editing screen definitions.
 *
 * Step 1: Edit screen fields (pre-filled from game state + existing data)
 * Step 2: Preview generated TS code
 *
 * Field derivation rules:
 * - Dungeon: selecting dungeon name locks location and world, defaults area, constrains palaceIndex
 * - Overworld: gridX/Y derived from roomIndex, world derived from roomIndex
 * - Interior: area/location freely chosen
 * - ID: auto-generated from type + roomIndex + prefix
 * - Status: independent, shown as StatusBadge in header
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Select, SegmentedControl, TagPicker, StatusBadge } from '../../components/primitives';
import type { SelectOption, SegmentOption, TagPickerGroup, ScreenStatus } from '../../components/primitives';
import type { ScreenDefinition, ScreenType, InteriorKind, VariantCondition } from '@shared/game/types';
import type { ScreenTag } from '@shared/game/data/screens/tags';
import { TAG_METADATA, TAG_NAMESPACES } from '@shared/game/data/screens/tags';
import { AREAS } from '@shared/game/data/screens/areas';
import { LOCATIONS } from '@shared/game/data/screens/locations';
import { serializeScreen, resolveScreenFile } from '@shared/game/data/screen-codegen';
import type { ScreenCodegenInput } from '@shared/game/data/screen-codegen';
import { PALACE_INDEX_NAMES, DUNGEON_META, getDungeonName } from '@shared/game/data/screens/game-values';
import './ScreenEditorDialog.css';

// ─── Props ───

interface ScreenEditorDialogProps {
  open: boolean;
  onClose: () => void;
  existingScreen: ScreenDefinition | null;
  gameState: {
    roomIndex: number;
    palaceIndex: number;
    isIndoors: boolean;
    isDarkWorld: boolean;
  };
}

// ─── Options derived from the data model ───

const TYPE_SEGMENTS: SegmentOption<ScreenType>[] = [
  { value: 'overworld', label: 'Overworld' },
  { value: 'dungeon', label: 'Dungeon' },
  { value: 'interior', label: 'Interior' },
];

const WORLD_SEGMENTS: SegmentOption<'light' | 'dark'>[] = [
  { value: 'light', label: 'Light World' },
  { value: 'dark', label: 'Dark World' },
];

const PALACE_OPTIONS: SelectOption[] = Object.entries(PALACE_INDEX_NAMES)
  .filter(([k]) => Number(k) !== 0xFF)
  .map(([value, label]) => ({ value, label: `0x${Number(value).toString(16).toUpperCase().padStart(2, '0')} — ${label}` }));

const INTERIOR_KIND_VALUES: InteriorKind[] = ['cave', 'house', 'shop', 'fairy', 'well', 'passage', 'hint', 'gamble', 'special'];
const INTERIOR_KIND_OPTIONS: SelectOption[] = INTERIOR_KIND_VALUES.map(k => ({
  value: k,
  label: k.charAt(0).toUpperCase() + k.slice(1),
}));

const CONDITION_TYPE_OPTIONS: SelectOption[] = [
  { value: 'always', label: 'Always (default fallback)' },
  { value: 'check', label: 'Tracker Check' },
  { value: 'flag', label: 'WRAM Flag' },
  { value: 'entrance', label: 'Entrance Used' },
  { value: 'progress', label: 'Progress Tier' },
];

/** Pre-built tag groups for the TagPicker */
const TAG_GROUPS: TagPickerGroup<ScreenTag>[] = TAG_NAMESPACES.map(ns => ({
  id: ns.id,
  label: ns.label,
  options: TAG_METADATA.filter(t => t.namespace === ns.id).map(t => ({ value: t.id, label: t.label })),
}));

// ─── Component ───

const ScreenEditorDialog = ({ open, onClose, existingScreen, gameState }: ScreenEditorDialogProps) => {
  const [step, setStep] = useState(0);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<ScreenType>('dungeon');
  const [world, setWorld] = useState<'light' | 'dark'>('light');
  const [status, setStatus] = useState<ScreenStatus>(undefined);
  const [areaId, setAreaId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [palaceIdx, setPalaceIdx] = useState('');
  const [interiorKind, setInteriorKind] = useState<InteriorKind>('cave');
  const [floor, setFloor] = useState('');
  const [gridX, setGridX] = useState('');
  const [gridY, setGridY] = useState('');
  const [entranceId, setEntranceId] = useState('');
  const [selectedTags, setSelectedTags] = useState<ScreenTag[]>([]);
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);

  // Variant state
  const [hasVariant, setHasVariant] = useState(false);
  const [variantKey, setVariantKey] = useState('');
  const [variantLabel, setVariantLabel] = useState('');
  const [conditionType, setConditionType] = useState<VariantCondition['type']>('always');
  // Condition-specific fields
  const [condCheckName, setCondCheckName] = useState('');
  const [condCheckCollected, setCondCheckCollected] = useState(false);
  const [condFlagAddr, setCondFlagAddr] = useState('');
  const [condFlagBit, setCondFlagBit] = useState('');
  const [condFlagValue, setCondFlagValue] = useState(true);
  const [condEntranceId, setCondEntranceId] = useState('');
  const [condProgressMin, setCondProgressMin] = useState('');
  const [condProgressMax, setCondProgressMax] = useState('');

  // Inline creation state
  const [creatingArea, setCreatingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [creatingLocation, setCreatingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  // Mutable registries (starts from static data, can grow during session)
  const [localAreas, setLocalAreas] = useState(AREAS);
  const [localLocations, setLocalLocations] = useState(LOCATIONS);

  // Track whether we've already initialized for this open session
  const prevOpenRef = useRef(false);

  // ─── Derived / locked state ───
  const dungeonName = palaceIdx ? getDungeonName(Number(palaceIdx)) : '';
  const dungeonMeta = type === 'dungeon' && dungeonName ? DUNGEON_META[dungeonName] : null;
  const isDungeonLocked = type === 'dungeon' && !!dungeonMeta;

  // For overworld, derive grid and world from roomIndex
  const overworldDerived = useMemo(() => {
    if (type !== 'overworld') return null;
    const idx = gameState.roomIndex;
    return {
      gridX: idx % 8,
      gridY: Math.floor(idx / 8) % 8,
      world: (idx >= 0x40 ? 'dark' : 'light') as 'light' | 'dark',
    };
  }, [type, gameState.roomIndex]);

  // ─── Mismatch warnings ───
  const mismatches: string[] = useMemo(() => {
    if (!existingScreen) return [];
    const warns: string[] = [];
    if (existingScreen.type === 'dungeon' && dungeonMeta) {
      const existingLocMatch = localLocations.find(l => l.name === existingScreen.location || l.id === existingScreen.location);
      if (existingLocMatch && existingLocMatch.id !== dungeonMeta.locationId) {
        warns.push(`Location "${existingScreen.location}" → will be corrected to "${localLocations.find(l => l.id === dungeonMeta.locationId)?.name ?? dungeonMeta.locationId}"`);
      }

      if (existingScreen.world !== dungeonMeta.world) {
        warns.push(`World "${existingScreen.world}" → will be corrected to "${dungeonMeta.world}"`);
      }
    }
    return warns;
  }, [existingScreen, dungeonMeta, localLocations, localAreas]);

  // Pre-fill only on open transition (false → true)
  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false;
      return;
    }
    if (prevOpenRef.current) return;
    prevOpenRef.current = true;

    setStep(0);
    setWriteError(null);

    if (existingScreen) {
      setName(existingScreen.name);
      setType(existingScreen.type);
      setWorld(existingScreen.world);
      setStatus(existingScreen.status);
      // For dungeons, palace index is the primary — area/location derived from meta
      if (existingScreen.type === 'dungeon') {
        setPalaceIdx(String(existingScreen.dungeon.palaceIndex));
        const derivedName = getDungeonName(existingScreen.dungeon.palaceIndex);
        const meta = DUNGEON_META[derivedName];
        if (meta) {
          setAreaId(meta.areaId);
          setLocationId(meta.locationId);
          setWorld(meta.world);
        } else {
          const matchedLoc = localLocations.find(l => l.name === existingScreen.location || l.id === existingScreen.location);
          setLocationId(matchedLoc?.id ?? existingScreen.location);
          const matchedArea = localAreas.find(a => a.name === existingScreen.area || a.id === existingScreen.area);
          setAreaId(matchedArea?.id ?? matchedLoc?.areaId ?? existingScreen.area);
        }
      } else {
        setPalaceIdx('');
        const matchedLoc = localLocations.find(l => l.name === existingScreen.location || l.id === existingScreen.location);
        setLocationId(matchedLoc?.id ?? existingScreen.location);
        const matchedArea = localAreas.find(a => a.name === existingScreen.area || a.id === existingScreen.area);
        setAreaId(matchedArea?.id ?? matchedLoc?.areaId ?? existingScreen.area);
      }
      setInteriorKind(existingScreen.type === 'interior' ? existingScreen.interior.kind : 'cave');
      setFloor(existingScreen.type === 'dungeon' && existingScreen.dungeon.floor != null ? String(existingScreen.dungeon.floor) : '');
      setGridX(existingScreen.type === 'dungeon' && existingScreen.dungeon.gridX != null ? String(existingScreen.dungeon.gridX) : existingScreen.type === 'overworld' ? String(existingScreen.overworld.gridX) : '');
      setGridY(existingScreen.type === 'dungeon' && existingScreen.dungeon.gridY != null ? String(existingScreen.dungeon.gridY) : existingScreen.type === 'overworld' ? String(existingScreen.overworld.gridY) : '');
      setEntranceId(existingScreen.entranceId != null ? String(existingScreen.entranceId) : '');
      setSelectedTags([...existingScreen.tags]);
      // Variant pre-fill
      if (existingScreen.variant) {
        setHasVariant(true);
        setVariantKey(existingScreen.variant.key);
        setVariantLabel(existingScreen.variant.label ?? '');
        const cond = existingScreen.variant.condition;
        setConditionType(cond.type);
        if (cond.type === 'check') { setCondCheckName(cond.name); setCondCheckCollected(cond.collected); }
        if (cond.type === 'flag') { setCondFlagAddr(cond.address); setCondFlagBit(String(cond.bit)); setCondFlagValue(cond.value); }
        if (cond.type === 'entrance') { setCondEntranceId(String(cond.id)); }
        if (cond.type === 'progress') { setCondProgressMin(cond.min != null ? String(cond.min) : ''); setCondProgressMax(cond.max != null ? String(cond.max) : ''); }
      } else {
        setHasVariant(false);
        setVariantKey('');
        setVariantLabel('');
        setConditionType('always');
      }
    } else {
      // Auto-generate from game state
      setName('');
      const isDungeon = gameState.palaceIndex <= 0x1A;
      setType(isDungeon ? 'dungeon' : 'interior');
      setStatus(undefined);
      setPalaceIdx(isDungeon ? String(gameState.palaceIndex) : '');
      // Dungeon: derive area/location from meta
      if (isDungeon) {
        const derivedName = getDungeonName(gameState.palaceIndex);
        const meta = DUNGEON_META[derivedName];
        if (meta) {
          setAreaId(meta.areaId);
          setLocationId(meta.locationId);
          setWorld(meta.world);
        } else {
          setWorld(gameState.isDarkWorld ? 'dark' : 'light');
          setAreaId('');
          setLocationId('');
        }
      } else {
        setWorld(gameState.isDarkWorld ? 'dark' : 'light');
        setAreaId('');
        setLocationId('');
      }
      setInteriorKind('cave');
      setFloor('');
      setGridX('');
      setGridY('');
      setEntranceId('');
      setSelectedTags([]);
      setHasVariant(false);
      setVariantKey('');
      setVariantLabel('');
      setConditionType('always');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const roomIndex = gameState.roomIndex;

  // ─── Palace selection handler (cascade area/location/world from meta) ───
  const handlePalaceChange = (v: string) => {
    setPalaceIdx(v);
    const derivedName = getDungeonName(Number(v));
    const meta = DUNGEON_META[derivedName];
    if (meta) {
      setAreaId(meta.areaId);
      setLocationId(meta.locationId);
      setWorld(meta.world);
    }
  };

  // ─── Apply overworld derivation when type is overworld ───
  useEffect(() => {
    if (overworldDerived) {
      setGridX(String(overworldDerived.gridX));
      setGridY(String(overworldDerived.gridY));
      setWorld(overworldDerived.world);
    }
  }, [overworldDerived]);

  // ─── Auto-generated ID ───
  const generatedId = useMemo(() => {
    if (existingScreen) return existingScreen.id;
    const hex = roomIndex.toString(16).padStart(roomIndex > 0xFF ? 4 : 2, '0');
    if (type === 'overworld') {
      const prefix = world === 'dark' ? 'dw' : 'lw';
      return `${prefix}-${hex}`;
    }
    if (type === 'dungeon') {
      const prefix = getDungeonPrefix(palaceIdx ? Number(palaceIdx) : gameState.palaceIndex);
      return `${prefix}-0x${hex}`;
    }
    const kindPrefix = interiorKind.slice(0, 4);
    return `${kindPrefix}-0x${hex}`;
  }, [existingScreen, roomIndex, type, world, palaceIdx, gameState.palaceIndex, interiorKind]);

  // ─── Area & Location options (filtered, with + New) ───
  const effectiveWorld = isDungeonLocked ? dungeonMeta!.world : world;

  const areaOptions: SelectOption[] = useMemo(() => {
    const filtered = localAreas.filter(a => a.world === effectiveWorld || a.world === 'both');
    const opts: SelectOption[] = filtered.map(a => ({ value: a.id, label: a.name }));
    opts.push({ value: '__new__', label: '+ New Area...' });
    return opts;
  }, [localAreas, effectiveWorld]);

  const locationOptions: SelectOption[] = useMemo(() => {
    const filtered = areaId
      ? localLocations.filter(l => l.areaId === areaId)
      : localLocations;
    const opts: SelectOption[] = filtered.map(l => ({ value: l.id, label: l.name }));
    opts.push({ value: '__new__', label: '+ New Location...' });
    return opts;
  }, [localLocations, areaId]);

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleCreateArea = () => {
    const trimmed = newAreaName.trim();
    if (!trimmed) return;
    const id = slugify(trimmed);
    const newArea = { id, name: trimmed, world: effectiveWorld as 'light' | 'dark' | 'both' };
    setLocalAreas(prev => [...prev, newArea]);
    setAreaId(id);
    setCreatingArea(false);
    setNewAreaName('');
  };

  const handleCreateLocation = () => {
    const trimmed = newLocationName.trim();
    if (!trimmed || !areaId) return;
    const id = slugify(trimmed);
    const newLoc = { id, name: trimmed, areaId };
    setLocalLocations(prev => [...prev, newLoc]);
    setLocationId(id);
    setCreatingLocation(false);
    setNewLocationName('');
  };

  // Resolve display names from IDs (use locked values for dungeon)
  const effectiveAreaId = areaId;
  const effectiveLocationId = isDungeonLocked ? dungeonMeta!.locationId : locationId;
  const resolvedArea = localAreas.find(a => a.id === effectiveAreaId)?.name ?? effectiveAreaId;
  const resolvedLocation = localLocations.find(l => l.id === effectiveLocationId)?.name ?? effectiveLocationId;

  // Effective grid values for overworld (locked)
  const effectiveGridX = type === 'overworld' && overworldDerived ? String(overworldDerived.gridX) : gridX;
  const effectiveGridY = type === 'overworld' && overworldDerived ? String(overworldDerived.gridY) : gridY;

  // Build the codegen input
  // Build variant condition from form state
  const builtVariant = useMemo(() => {
    if (!hasVariant || !variantKey) return undefined;
    let condition: VariantCondition;
    switch (conditionType) {
      case 'check': condition = { type: 'check', name: condCheckName, collected: condCheckCollected }; break;
      case 'flag': condition = { type: 'flag', address: condFlagAddr, bit: Number(condFlagBit) || 0, value: condFlagValue }; break;
      case 'entrance': condition = { type: 'entrance', id: Number(condEntranceId) || 0 }; break;
      case 'progress': condition = { type: 'progress', min: condProgressMin ? Number(condProgressMin) : undefined, max: condProgressMax ? Number(condProgressMax) : undefined }; break;
      default: condition = { type: 'always' }; break;
    }
    return { key: variantKey, label: variantLabel || undefined, condition };
  }, [hasVariant, variantKey, variantLabel, conditionType, condCheckName, condCheckCollected, condFlagAddr, condFlagBit, condFlagValue, condEntranceId, condProgressMin, condProgressMax]);

  const codegenInput = useMemo((): ScreenCodegenInput => ({
    id: generatedId,
    name,
    type,
    world: isDungeonLocked ? dungeonMeta!.world : (type === 'overworld' && overworldDerived ? overworldDerived.world : world),
    location: resolvedLocation,
    area: resolvedArea,
    roomIndex,
    overworld: type === 'overworld' ? { gridX: Number(effectiveGridX) || 0, gridY: Number(effectiveGridY) || 0 } : undefined,
    dungeon: type === 'dungeon' && palaceIdx ? { palaceIndex: Number(palaceIdx), floor: floor ? Number(floor) : undefined, gridX: gridX ? Number(gridX) : undefined, gridY: gridY ? Number(gridY) : undefined } : undefined,
    interior: type === 'interior' ? { kind: interiorKind } : undefined,
    entranceId: type === 'interior' && entranceId ? Number(entranceId) : undefined,
    status,
    tags: selectedTags,
    variant: builtVariant,
  }), [generatedId, name, type, world, roomIndex, palaceIdx, resolvedLocation, resolvedArea, dungeonMeta, isDungeonLocked, overworldDerived, interiorKind, effectiveGridX, effectiveGridY, gridX, gridY, floor, entranceId, status, selectedTags, builtVariant]);

  const generatedCode = useMemo(() => serializeScreen(codegenInput), [codegenInput]);
  const targetFile = useMemo(() => resolveScreenFile(codegenInput), [codegenInput]);

  const handleWrite = async () => {
    setWriting(true);
    setWriteError(null);
    try {
      // Persist any newly created areas/locations to registry files
      const newAreas = localAreas.filter(a => !AREAS.some(orig => orig.id === a.id));
      const newLocations = localLocations.filter(l => !LOCATIONS.some(orig => orig.id === l.id));

      if (newAreas.length > 0) {
        const res = await window.api.screenEditor.appendRegistry({ type: 'area', entries: newAreas });
        if (!res.success) { setWriteError(res.error ?? 'Failed to write areas'); setWriting(false); return; }
      }
      if (newLocations.length > 0) {
        const res = await window.api.screenEditor.appendRegistry({ type: 'location', entries: newLocations });
        if (!res.success) { setWriteError(res.error ?? 'Failed to write locations'); setWriting(false); return; }
      }

      const result = await window.api.screenEditor.writeRegion({
        filePath: targetFile.relativePath,
        code: generatedCode,
        screenId: existingScreen?.id ?? null,
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
    <div className="screen-editor-backdrop" onClick={onClose}>
      <div className="screen-editor" onClick={e => e.stopPropagation()}>
        <div className="screen-editor__header">
          <h3>{existingScreen ? 'Edit Screen' : 'Create Screen'}</h3>
          <span className="screen-editor__room-id">
            Room 0x{roomIndex.toString(16).toUpperCase().padStart(roomIndex > 0xFF ? 4 : 2, '0')}
          </span>
          <code className="screen-editor__generated-id">{generatedId}</code>
          <StatusBadge status={status} interactive onChange={setStatus} />
        </div>

        {/* Mismatch warnings */}
        {mismatches.length > 0 && (
          <div className="screen-editor__warnings">
            {mismatches.map((w, i) => <p key={i}>{w}</p>)}
          </div>
        )}

        {/* Step indicator */}
        <div className="screen-editor__steps">
          <button className={step === 0 ? 'active' : ''} onClick={() => setStep(0)}>1. Fields</button>
          <button className={step === 1 ? 'active' : ''} onClick={() => setStep(1)}>2. Preview</button>
        </div>

        {/* Step 1: Fields */}
        {step === 0 && (
          <div className="screen-editor__form">

            {/* ── Section 1: Classification ── */}
            <div className="screen-editor__section">
              <SegmentedControl
                label="Type"
                value={type}
                options={TYPE_SEGMENTS}
                onChange={setType}
              />
              {/* World — locked for dungeon (derived from meta) and overworld (derived from roomIndex) */}
              {type === 'interior' ? (
                <SegmentedControl
                  label="World"
                  value={world}
                  options={WORLD_SEGMENTS}
                  onChange={setWorld}
                />
              ) : (
                <div className="screen-editor__row screen-editor__row--locked">
                  <label>World</label>
                  <span className="screen-editor__locked-value">
                    {(isDungeonLocked ? dungeonMeta!.world : overworldDerived?.world ?? world) === 'light' ? 'Light World' : 'Dark World'}
                  </span>
                </div>
              )}
            </div>

            {/* ── Section 2: Type-specific panel ── */}
            <div className="screen-editor__panel">
              <span className="screen-editor__panel-label">
                {type === 'dungeon' ? 'Dungeon' : type === 'overworld' ? 'Overworld' : 'Interior'} Details
              </span>

              {type === 'dungeon' && (
                <>
                  <div className="screen-editor__row">
                    <label>Palace Index</label>
                    <Select options={PALACE_OPTIONS} value={palaceIdx} onChange={handlePalaceChange} placeholder="Select palace..." searchable />
                  </div>
                  {dungeonName && (
                    <div className="screen-editor__row screen-editor__row--locked">
                      <label>Dungeon</label>
                      <span className="screen-editor__locked-value">{dungeonName}</span>
                    </div>
                  )}
                  <div className="screen-editor__row screen-editor__row--half">
                    <div>
                      <label>Floor</label>
                      <input className="text-input" value={floor} onChange={e => setFloor(e.target.value)} placeholder="-1, 0, 1..." />
                    </div>
                    <div>
                      <label>Grid X, Y</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input className="text-input" value={gridX} onChange={e => setGridX(e.target.value)} placeholder="X" />
                        <input className="text-input" value={gridY} onChange={e => setGridY(e.target.value)} placeholder="Y" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {type === 'interior' && (
                <div className="screen-editor__row">
                  <label>Interior Kind</label>
                  <Select options={INTERIOR_KIND_OPTIONS} value={interiorKind} onChange={v => setInteriorKind(v as InteriorKind)} />
                </div>
              )}

              {type === 'overworld' && (
                <div className="screen-editor__row screen-editor__row--half">
                  <div className="screen-editor__row--locked">
                    <label>Grid X</label>
                    <span className="screen-editor__locked-value">{effectiveGridX}</span>
                  </div>
                  <div className="screen-editor__row--locked">
                    <label>Grid Y</label>
                    <span className="screen-editor__locked-value">{effectiveGridY}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Section 3: Identity & Metadata ── */}
            <div className="screen-editor__section">
              <div className="screen-editor__row">
                <label>Name</label>
                <input className="text-input" value={name} onChange={e => setName(e.target.value)} placeholder="Screen name" />
              </div>

              {/* Area — editable for all types (dungeon defaults from meta) */}
              <div className="screen-editor__row">
                <label>Area</label>
                {!creatingArea ? (
                  <div className="screen-editor__select-with-action">
                    <Select
                      options={areaOptions}
                      value={areaId}
                      onChange={v => {
                        if (v === '__new__') { setCreatingArea(true); setNewAreaName(''); }
                        else { setAreaId(v); setLocationId(''); }
                      }}
                      placeholder="Select area..."
                      searchable
                    />
                  </div>
                ) : (
                  <div className="screen-editor__inline-create">
                    <input className="text-input" value={newAreaName} onChange={e => setNewAreaName(e.target.value)} placeholder="New area name" autoFocus />
                    <Button variant="primary" onClick={handleCreateArea} disabled={!newAreaName.trim()}>Add</Button>
                    <Button variant="secondary" onClick={() => setCreatingArea(false)}>Cancel</Button>
                  </div>
                )}
              </div>

              {/* Location — locked for dungeon, editable for interior/overworld */}
              {isDungeonLocked ? (
                <div className="screen-editor__row screen-editor__row--locked">
                  <label>Location</label>
                  <span className="screen-editor__locked-value">{resolvedLocation}</span>
                </div>
              ) : (
                <div className="screen-editor__row">
                  <label>Location</label>
                  {!creatingLocation ? (
                    <div className="screen-editor__select-with-action">
                      <Select
                        options={locationOptions}
                        value={locationId}
                        onChange={v => {
                          if (v === '__new__') { setCreatingLocation(true); setNewLocationName(''); }
                          else { setLocationId(v); }
                        }}
                        placeholder="Select location..."
                        searchable
                      />
                    </div>
                  ) : (
                    <div className="screen-editor__inline-create">
                      <input className="text-input" value={newLocationName} onChange={e => setNewLocationName(e.target.value)} placeholder="New location name" autoFocus />
                      <Button variant="primary" onClick={handleCreateLocation} disabled={!newLocationName.trim() || !areaId}>Add</Button>
                      <Button variant="secondary" onClick={() => setCreatingLocation(false)}>Cancel</Button>
                    </div>
                  )}
                </div>
              )}

              {type === 'interior' && (
                <div className="screen-editor__row">
                  <label>Entrance ID</label>
                  <input className="text-input" value={entranceId} onChange={e => setEntranceId(e.target.value)} placeholder="Optional hex — disambiguates shared rooms" />
                </div>
              )}
              <TagPicker
                label="Tags"
                groups={TAG_GROUPS}
                value={selectedTags}
                onChange={setSelectedTags}
              />
            </div>

            {/* ── Section 4: Variant (optional) ── */}
            <div className="screen-editor__section">
              <div className="screen-editor__row">
                <label>
                  <input type="checkbox" checked={hasVariant} onChange={e => setHasVariant(e.target.checked)} />
                  {' '}Has Variant
                </label>
              </div>
              {hasVariant && (
                <>
                  <div className="screen-editor__row screen-editor__row--half">
                    <div>
                      <label>Key</label>
                      <input className="text-input" value={variantKey} onChange={e => setVariantKey(e.target.value)} placeholder="e.g. intro" />
                    </div>
                    <div>
                      <label>Label (optional)</label>
                      <input className="text-input" value={variantLabel} onChange={e => setVariantLabel(e.target.value)} placeholder="Display label" />
                    </div>
                  </div>
                  <div className="screen-editor__row">
                    <label>Condition</label>
                    <Select
                      options={CONDITION_TYPE_OPTIONS}
                      value={conditionType}
                      onChange={v => setConditionType(v as VariantCondition['type'])}
                    />
                  </div>
                  {conditionType === 'check' && (
                    <div className="screen-editor__row screen-editor__row--half">
                      <div>
                        <label>Check Name</label>
                        <input className="text-input" value={condCheckName} onChange={e => setCondCheckName(e.target.value)} placeholder="e.g. Link's Uncle" />
                      </div>
                      <div>
                        <label>
                          <input type="checkbox" checked={condCheckCollected} onChange={e => setCondCheckCollected(e.target.checked)} />
                          {' '}Collected
                        </label>
                      </div>
                    </div>
                  )}
                  {conditionType === 'flag' && (
                    <div className="screen-editor__row screen-editor__row--half">
                      <div>
                        <label>WRAM Address</label>
                        <input className="text-input" value={condFlagAddr} onChange={e => setCondFlagAddr(e.target.value)} placeholder="0x7EF..." />
                      </div>
                      <div>
                        <label>Bit</label>
                        <input className="text-input" value={condFlagBit} onChange={e => setCondFlagBit(e.target.value)} placeholder="0-7" />
                      </div>
                      <div>
                        <label>
                          <input type="checkbox" checked={condFlagValue} onChange={e => setCondFlagValue(e.target.checked)} />
                          {' '}Value (set)
                        </label>
                      </div>
                    </div>
                  )}
                  {conditionType === 'entrance' && (
                    <div className="screen-editor__row">
                      <label>Entrance ID</label>
                      <input className="text-input" value={condEntranceId} onChange={e => setCondEntranceId(e.target.value)} placeholder="Entrance ID to match" />
                    </div>
                  )}
                  {conditionType === 'progress' && (
                    <div className="screen-editor__row screen-editor__row--half">
                      <div>
                        <label>Min Tier</label>
                        <input className="text-input" value={condProgressMin} onChange={e => setCondProgressMin(e.target.value)} placeholder="Optional" />
                      </div>
                      <div>
                        <label>Max Tier</label>
                        <input className="text-input" value={condProgressMax} onChange={e => setCondProgressMax(e.target.value)} placeholder="Optional" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        )}

        {/* Step 2: Preview */}
        {step === 1 && (
          <div className="screen-editor__preview">
            <div className="screen-editor__file-target">
              <span>Target: </span>
              <code>{targetFile.relativePath}</code>
            </div>
            <pre className="screen-editor__code">{generatedCode}</pre>
            {writeError && <p className="screen-editor__error">{writeError}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="screen-editor__actions">
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
};

// ─── Helpers ───

const getDungeonPrefix = (palaceIndex: number): string => {
  const map: Record<number, string> = {
    0x00: 'hc', 0x02: 'hc', 0x04: 'ep', 0x06: 'dp', 0x08: 'th',
    0x0A: 'pod', 0x0C: 'sp', 0x0E: 'sw', 0x10: 'tt',
    0x12: 'ip', 0x14: 'mm', 0x16: 'tr', 0x18: 'gt', 0x1A: 'ct',
  };
  return map[palaceIndex] ?? 'room';
};

export { ScreenEditorDialog };
