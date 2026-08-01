/* @layer renderer-widgets @kind hook */
/** Derived/codegen state + write handler for the ScreenEditor, fed by the form hook. */
import { useMemo } from 'react';
import { getArea, getLocation } from '@shared/game/data';
import type { AreaId, LocationId, VariantCondition } from '@shared/game/data';
import { serializeScreenRecord } from '@shared/game/data/record-codegen';
import { screenRecordFile } from '@shared/game/data/record-file-targets';
import type { SelectOption } from '../../../../design-system/primitives';
import { buildScreenRecord } from './build-screen-record';
import type { ScreenEditorProps } from './screen-editor.type';
import type { useScreenEditorForm } from './useScreenEditorForm';

type Form = ReturnType<typeof useScreenEditorForm>;

const NEW_OPTION = '__new__';

const maybeNumber = (v: string): number | undefined => (v === '' ? undefined : Number(v));

const useScreenEditorDerived = (props: ScreenEditorProps, form: Form) => {
  const { existingScreen, gameState, onClose } = props;
  const {
    randomizerName, kind, status, areaId, locationId, palaceIdx, interiorKind, floor, gridX, gridY,
    entranceId, selectedTags, setWriting, setWriteError, hasVariant, variantKey, variantLabel,
    conditionType, condCheckId, condCheckCollected, condFlagAddr, condFlagBit, condFlagValue,
    condEntranceId, condProgressMin, condProgressMax, areas, locations,
    lockedGeography, effectiveWorld, overworldDerived,
  } = form;

  const roomIndex = gameState.roomIndex;

  // ─── Mismatch warnings ───
  const mismatches: string[] = useMemo(() => {
    if (!existingScreen || !lockedGeography) return [];
    const warns: string[] = [];
    if (existingScreen.locationId !== lockedGeography.locationId) {
      warns.push(`Location ${existingScreen.locationId} → will be corrected to ${lockedGeography.locationId}`);
    }
    if (existingScreen.areaId !== lockedGeography.areaId) {
      warns.push(`Area ${existingScreen.areaId} → will be corrected to ${lockedGeography.areaId}`);
    }
    if (existingScreen.world !== lockedGeography.world) {
      warns.push(`World "${existingScreen.world}" → will be corrected to "${lockedGeography.world}"`);
    }
    return warns;
  }, [existingScreen, lockedGeography]);

  // ─── Area & Location options (filtered, with + New) ───
  const areaOptions: SelectOption[] = useMemo(() => {
    const opts: SelectOption[] = areas
      .filter(a => a.world === effectiveWorld || a.world === 'both')
      .map(a => ({ value: a.id, label: a.randomizerName }));
    opts.push({ value: NEW_OPTION, label: '+ New Area...' });
    return opts;
  }, [areas, effectiveWorld]);

  const locationOptions: SelectOption[] = useMemo(() => {
    const opts: SelectOption[] = locations
      .filter(l => !areaId || l.areaId === areaId)
      .map(l => ({ value: l.id, label: l.randomizerName }));
    opts.push({ value: NEW_OPTION, label: '+ New Location...' });
    return opts;
  }, [locations, areaId]);

  // Locked values for dungeons come from the dungeon's own rooms, by id.
  const effectiveAreaId: AreaId | '' = lockedGeography ? lockedGeography.areaId : areaId;
  const effectiveLocationId: LocationId | '' = lockedGeography ? lockedGeography.locationId : locationId;
  // Display only — resolved at the last moment, never persisted.
  const resolvedLocation = effectiveLocationId ? getLocation(effectiveLocationId).randomizerName : '';
  const resolvedArea = effectiveAreaId ? getArea(effectiveAreaId).randomizerName : '';

  const effectiveGridX = kind === 'overworld' && overworldDerived ? String(overworldDerived.gridX) : gridX;
  const effectiveGridY = kind === 'overworld' && overworldDerived ? String(overworldDerived.gridY) : gridY;

  // Build the variant condition from form state. The check leaf carries a CheckId.
  const builtVariant = useMemo(() => {
    if (!hasVariant || !variantKey) return undefined;
    let condition: VariantCondition;
    switch (conditionType) {
      case 'check': condition = { type: 'check', id: condCheckId, collected: condCheckCollected }; break;
      case 'flag': condition = { type: 'flag', address: Number(condFlagAddr) || 0, bit: Number(condFlagBit) || 0, value: condFlagValue }; break;
      case 'entrance': condition = { type: 'entrance', id: Number(condEntranceId) || 0 }; break;
      case 'progress': condition = { type: 'progress', min: maybeNumber(condProgressMin), max: maybeNumber(condProgressMax) }; break;
      default: condition = { type: 'always' }; break;
    }
    return { key: variantKey, label: variantLabel || undefined, condition };
  }, [hasVariant, variantKey, variantLabel, conditionType, condCheckId, condCheckCollected, condFlagAddr, condFlagBit, condFlagValue, condEntranceId, condProgressMin, condProgressMax]);

  const draft = useMemo(() => buildScreenRecord({
    kind,
    world: effectiveWorld,
    interiorKind,
    randomizerName,
    areaId: effectiveAreaId,
    locationId: effectiveLocationId,
    status,
    tags: selectedTags,
    variant: builtVariant,
    roomIndex,
    overworldIndex: gameState.overworldIndex,
    palaceIndex: kind === 'dungeon' ? maybeNumber(palaceIdx) : undefined,
    entranceId: kind === 'interior' ? maybeNumber(entranceId) : undefined,
    gridX: maybeNumber(effectiveGridX),
    gridY: maybeNumber(effectiveGridY),
    floor: kind === 'dungeon' ? maybeNumber(floor) : undefined,
    existing: existingScreen,
  }), [kind, effectiveWorld, overworldDerived, interiorKind, randomizerName,
    effectiveAreaId, effectiveLocationId, status, selectedTags, builtVariant, roomIndex,
    gameState.overworldIndex, palaceIdx, entranceId, effectiveGridX, effectiveGridY, floor, existingScreen]);

  const generatedCode = useMemo(() => {
    if (!draft.record) return draft.blockers.map(b => `// ${b}`).join('\n');
    const withId = existingScreen ? { id: existingScreen.id, ...draft.record } : draft.record;
    return serializeScreenRecord(withId);
  }, [draft, existingScreen]);

  const targetFile = useMemo(() => {
    if (!draft.record) return { relativePath: null, unresolved: 'the record is incomplete' };
    return screenRecordFile({ id: existingScreen?.id, ...draft.record });
  }, [draft, existingScreen]);

  const canWrite = draft.record !== null && targetFile.relativePath !== null;

  const handleWrite = async () => {
    const record = draft.record;
    const filePath = targetFile.relativePath;
    if (!record || !filePath) return;
    setWriting(true);
    setWriteError(null);
    try {
      const result = await window.api.screenEditor.writeScreen({
        filePath,
        record,
        replaceId: existingScreen?.id ?? null,
      });
      if (!result.success) setWriteError(result.error);
      else onClose();
    } catch (e: unknown) {
      setWriteError(e instanceof Error ? e.message : 'Write failed');
    } finally {
      setWriting(false);
    }
  };

  return {
    roomIndex, mismatches, screenId: existingScreen?.id ?? null, areaOptions, locationOptions,
    resolvedLocation, resolvedArea, effectiveGridX, effectiveGridY, blockers: draft.blockers,
    generatedCode, targetFile, canWrite, handleWrite, newOptionValue: NEW_OPTION,
  };
};

export { useScreenEditorDerived };
