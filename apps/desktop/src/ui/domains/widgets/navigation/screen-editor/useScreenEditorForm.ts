/* @layer renderer-widgets @kind hook */
/** All ScreenEditor form field state + prefill/derive effects + create handlers. */
import { useState, useMemo, useEffect, useRef } from 'react';
import type { ScreenType, InteriorKind, VariantCondition } from '@shared/game/types';
import type { ScreenStatus } from '../../../../design-system/primitives';
import type { ScreenTag } from '@shared/game/data/screens/tags';
import { AREAS } from '@shared/game/data/screens/areas';
import { LOCATIONS } from '@shared/game/data/screens/locations';
import { DUNGEON_META, getDungeonName } from '@shared/game/data/screens/game-values';
import { slugify } from './screen-editor-constants';
import { applyPrefill } from './screen-editor-prefill';
import type { ScreenEditorProps } from './types';

const useScreenEditorForm = (props: ScreenEditorProps) => {
  const { open, existingScreen, gameState } = props;

  const [step, setStep] = useState(0);
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

  const [hasVariant, setHasVariant] = useState(false);
  const [variantKey, setVariantKey] = useState('');
  const [variantLabel, setVariantLabel] = useState('');
  const [conditionType, setConditionType] = useState<VariantCondition['type']>('always');
  const [condCheckName, setCondCheckName] = useState('');
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

  const [localAreas, setLocalAreas] = useState(AREAS);
  const [localLocations, setLocalLocations] = useState(LOCATIONS);

  const prevOpenRef = useRef(false);

  // ─── Derived / locked state ───
  const dungeonName = palaceIdx ? getDungeonName(Number(palaceIdx)) : '';
  const dungeonMeta = type === 'dungeon' && dungeonName ? DUNGEON_META[dungeonName] : null;
  const isDungeonLocked = type === 'dungeon' && !!dungeonMeta;
  const effectiveWorld = isDungeonLocked ? dungeonMeta!.world : world;

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

  // Pre-fill only on open transition (false → true)
  useEffect(() => {
    if (!open) {
      prevOpenRef.current = false;
      return;
    }
    if (prevOpenRef.current) return;
    prevOpenRef.current = true;
    applyPrefill({
      existingScreen, gameState, localAreas, localLocations,
      set: {
        setStep, setWriteError, setName, setType, setWorld, setStatus, setAreaId, setLocationId, setPalaceIdx,
        setInteriorKind, setFloor, setGridX, setGridY, setEntranceId, setSelectedTags, setHasVariant, setVariantKey,
        setVariantLabel, setConditionType, setCondCheckName, setCondCheckCollected, setCondFlagAddr, setCondFlagBit,
        setCondFlagValue, setCondEntranceId, setCondProgressMin, setCondProgressMax,
      },
    });
  }, [open]);

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

  return {
    step, setStep, name, setName, type, setType, world, setWorld, status, setStatus,
    areaId, setAreaId, locationId, setLocationId, palaceIdx, interiorKind, setInteriorKind,
    floor, setFloor, gridX, setGridX, gridY, setGridY, entranceId, setEntranceId,
    selectedTags, setSelectedTags, writing, setWriting, writeError, setWriteError,
    hasVariant, setHasVariant, variantKey, setVariantKey, variantLabel, setVariantLabel,
    conditionType, setConditionType, condCheckName, setCondCheckName, condCheckCollected, setCondCheckCollected,
    condFlagAddr, setCondFlagAddr, condFlagBit, setCondFlagBit, condFlagValue, setCondFlagValue,
    condEntranceId, setCondEntranceId, condProgressMin, setCondProgressMin, condProgressMax, setCondProgressMax,
    creatingArea, setCreatingArea, newAreaName, setNewAreaName, creatingLocation, setCreatingLocation,
    newLocationName, setNewLocationName, localAreas, localLocations,
    dungeonName, dungeonMeta, isDungeonLocked, effectiveWorld, overworldDerived,
    handlePalaceChange, handleCreateArea, handleCreateLocation,
  };
};

export { useScreenEditorForm };
