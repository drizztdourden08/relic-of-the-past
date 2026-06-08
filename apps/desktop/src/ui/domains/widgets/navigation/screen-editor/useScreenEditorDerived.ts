/* @layer renderer-widgets @kind hook */
/** Derived/codegen state + write handler for the ScreenEditor, fed by the form hook. */
import { useMemo } from 'react';
import type { SelectOption } from '../../../../design-system/primitives';
import type { VariantCondition } from '@shared/game/types';
import { serializeScreen, resolveScreenFile } from '@shared/game/data/screen-codegen';
import type { ScreenCodegenInput } from '@shared/game/data/screen-codegen';
import { AREAS } from '@shared/game/data/screens/areas';
import { LOCATIONS } from '@shared/game/data/screens/locations';
import { getDungeonPrefix } from './screen-editor-constants';
import type { ScreenEditorProps } from './types';
import type { useScreenEditorForm } from './useScreenEditorForm';

type Form = ReturnType<typeof useScreenEditorForm>;

const useScreenEditorDerived = (props: ScreenEditorProps, form: Form) => {
  const { existingScreen, gameState, onClose } = props;
  const {
    name, type, world, status, areaId, locationId, palaceIdx, interiorKind, floor, gridX, gridY,
    entranceId, selectedTags, setWriting, setWriteError, hasVariant, variantKey, variantLabel,
    conditionType, condCheckName, condCheckCollected, condFlagAddr, condFlagBit, condFlagValue,
    condEntranceId, condProgressMin, condProgressMax, localAreas, localLocations,
    dungeonMeta, isDungeonLocked, effectiveWorld, overworldDerived,
  } = form;

  const roomIndex = gameState.roomIndex;

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

  // Resolve display names from IDs (use locked values for dungeon)
  const effectiveAreaId = areaId;
  const effectiveLocationId = isDungeonLocked ? dungeonMeta!.locationId : locationId;
  const resolvedArea = localAreas.find(a => a.id === effectiveAreaId)?.name ?? effectiveAreaId;
  const resolvedLocation = localLocations.find(l => l.id === effectiveLocationId)?.name ?? effectiveLocationId;

  // Effective grid values for overworld (locked)
  const effectiveGridX = type === 'overworld' && overworldDerived ? String(overworldDerived.gridX) : gridX;
  const effectiveGridY = type === 'overworld' && overworldDerived ? String(overworldDerived.gridY) : gridY;

  // Build variant condition from form state
  const builtVariant = useMemo(() => {
    if (!hasVariant || !variantKey) return undefined;
    let condition: VariantCondition;
    switch (conditionType) {
      case 'check': condition = { type: 'check', name: condCheckName, collected: condCheckCollected }; break;
      case 'flag': condition = { type: 'flag', address: Number(condFlagAddr) || 0, bit: Number(condFlagBit) || 0, value: condFlagValue }; break;
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

  return {
    roomIndex, mismatches, generatedId, areaOptions, locationOptions,
    resolvedLocation, effectiveGridX, effectiveGridY, generatedCode, targetFile, handleWrite,
  };
};

export { useScreenEditorDerived };
