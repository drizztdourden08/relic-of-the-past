/* @layer renderer-widgets @kind hook */
/** All ScreenEditor form field state + prefill/derive effects + create handlers. */
import { useState, useMemo, useEffect, useRef } from 'react';
import { all } from '@shared/game/data';
import type {
  AreaId, InteriorKind, LocationId, ScreenKind, ScreenTag, VariantCondition,
} from '@shared/game/data';
import type { ScreenStatus } from '../../../../design-system/primitives';
import { allocateArea, allocateLocation } from './allocate-geography';
import type { NewArea, NewLocation } from './allocate-geography';
import { dungeonGeographyFor } from './dungeon-geography';
import { applyPrefill } from './screen-editor-prefill';
import type { ScreenEditorProps } from './screen-editor.type';

const useScreenEditorForm = (props: ScreenEditorProps) => {
  const { open, existingScreen, gameState } = props;

  const [step, setStep] = useState(0);
  const [randomizerName, setRandomizerName] = useState('');
  const [kind, setKind] = useState<ScreenKind>('dungeon');
  const [world, setWorld] = useState<'light' | 'dark'>('light');
  const [status, setStatus] = useState<ScreenStatus>(undefined);
  const [areaId, setAreaId] = useState<AreaId | ''>('');
  const [locationId, setLocationId] = useState<LocationId | ''>('');
  const [palaceIdx, setPalaceIdx] = useState('');
  const [interiorKind, setInteriorKind] = useState<InteriorKind>('cave');
  const [floor, setFloor] = useState('');
  const [gridX, setGridX] = useState('');
  const [gridY, setGridY] = useState('');
  const [entranceId, setEntranceId] = useState('');
  const [selectedTags, setSelectedTags] = useState<ScreenTag[]>([]);
  const [writing, setWriting] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);

  const [hasVariant, setHasVariant] = useState(false);
  const [variantKey, setVariantKey] = useState('');
  const [variantLabel, setVariantLabel] = useState('');
  const [conditionType, setConditionType] = useState<VariantCondition['type']>('always');
  const [condCheckId, setCondCheckId] = useState('');
  const [condCheckCollected, setCondCheckCollected] = useState(false);
  const [condFlagAddr, setCondFlagAddr] = useState('');
  const [condFlagBit, setCondFlagBit] = useState('');
  const [condFlagValue, setCondFlagValue] = useState(true);
  const [condEntranceId, setCondEntranceId] = useState('');
  const [condProgressMin, setCondProgressMin] = useState('');
  const [condProgressMax, setCondProgressMax] = useState('');

  const [creatingArea, setCreatingArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');
  const [creatingLocation, setCreatingLocation] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  // Geography read straight off the facade. Newly created records are appended
  // here so the pickers show them before the dataset is next imported — and these
  // two lists hold the ALLOCATED types, so a record assembled in this component
  // (from a slugified name or anything else) is not assignable into them.
  const [extraAreas, setExtraAreas] = useState<NewArea[]>([]);
  const [extraLocations, setExtraLocations] = useState<NewLocation[]>([]);
  const areas = useMemo(() => [...all('area'), ...extraAreas], [extraAreas]);
  const locations = useMemo(() => [...all('location'), ...extraLocations], [extraLocations]);

  const prevOpenRef = useRef(false);

  // ─── Derived / locked state ───
  const dungeonGeography = useMemo(
    () => (palaceIdx ? dungeonGeographyFor(Number(palaceIdx)) : null),
    [palaceIdx],
  );
  // Non-null exactly when a dungeon's own rooms decide this screen's geography.
  const lockedGeography = kind === 'dungeon' ? dungeonGeography : null;
  const isDungeonLocked = lockedGeography !== null;

  // For overworld, derive grid and world from the live screen index.
  const overworldDerived = useMemo(() => {
    if (kind !== 'overworld') return null;
    // overworldIndex is the unified 0x00-0x7F space, so the high half is the dark world.
    const idx = gameState.overworldIndex;
    return {
      gridX: idx % 8,
      gridY: Math.floor(idx / 8) % 8,
      world: (idx >= 0x40 ? 'dark' : 'light') as 'light' | 'dark',
    };
  }, [kind, gameState.overworldIndex]);

  /** The world the record will carry: locked by the dungeon, else by the live screen. */
  const effectiveWorld = lockedGeography?.world ?? overworldDerived?.world ?? world;

  // Pre-fill only on open transition (false → true)
  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false;
      return;
    }
    if (prevOpenRef.current) return;
    prevOpenRef.current = true;
    applyPrefill({
      existingScreen, gameState,
      set: {
        setStep, setWriteError, setRandomizerName, setKind, setWorld, setStatus, setAreaId, setLocationId,
        setPalaceIdx, setInteriorKind, setFloor, setGridX, setGridY, setEntranceId, setSelectedTags,
        setHasVariant, setVariantKey, setVariantLabel, setConditionType, setCondCheckId, setCondCheckCollected,
        setCondFlagAddr, setCondFlagBit, setCondFlagValue, setCondEntranceId, setCondProgressMin, setCondProgressMax,
      },
    });
  }, [open]);

  // ─── Palace selection handler (cascade area/location/world from the dungeon) ───
  const handlePalaceChange = (v: string) => {
    setPalaceIdx(v);
    const geography = dungeonGeographyFor(Number(v));
    if (geography) {
      setAreaId(geography.areaId);
      setLocationId(geography.locationId);
      setWorld(geography.world);
    }
  };

  // ─── Apply overworld derivation when the kind is overworld ───
  useEffect(() => {
    if (overworldDerived) {
      setGridX(String(overworldDerived.gridX));
      setGridY(String(overworldDerived.gridY));
      setWorld(overworldDerived.world);
    }
  }, [overworldDerived]);

  const handleCreateArea = async () => {
    const trimmed = newAreaName.trim();
    if (!trimmed) return;
    const result = await allocateArea(trimmed, effectiveWorld);
    if ('error' in result) { setWriteError(result.error); return; }
    setExtraAreas(prev => [...prev, result.record]);
    setAreaId(result.record.id);
    setLocationId('');
    setCreatingArea(false);
    setNewAreaName('');
  };

  const handleCreateLocation = async () => {
    const trimmed = newLocationName.trim();
    if (!trimmed || !areaId) return;
    const result = await allocateLocation(trimmed, areaId);
    if ('error' in result) { setWriteError(result.error); return; }
    setExtraLocations(prev => [...prev, result.record]);
    setLocationId(result.record.id);
    setCreatingLocation(false);
    setNewLocationName('');
  };

  return {
    step, setStep, randomizerName, setRandomizerName, kind, setKind, world, setWorld, status, setStatus,
    areaId, setAreaId, locationId, setLocationId, palaceIdx, interiorKind, setInteriorKind,
    floor, setFloor, gridX, setGridX, gridY, setGridY, entranceId, setEntranceId,
    selectedTags, setSelectedTags, writing, setWriting, writeError, setWriteError,
    hasVariant, setHasVariant, variantKey, setVariantKey, variantLabel, setVariantLabel,
    conditionType, setConditionType, condCheckId, setCondCheckId, condCheckCollected, setCondCheckCollected,
    condFlagAddr, setCondFlagAddr, condFlagBit, setCondFlagBit, condFlagValue, setCondFlagValue,
    condEntranceId, setCondEntranceId, condProgressMin, setCondProgressMin, condProgressMax, setCondProgressMax,
    creatingArea, setCreatingArea, newAreaName, setNewAreaName, creatingLocation, setCreatingLocation,
    newLocationName, setNewLocationName, areas, locations,
    dungeonGeography, lockedGeography, isDungeonLocked, effectiveWorld, overworldDerived,
    handlePalaceChange, handleCreateArea, handleCreateLocation,
  };
};

export { useScreenEditorForm };
