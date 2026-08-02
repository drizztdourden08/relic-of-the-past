/* @layer renderer-widgets @kind logic */
/**
 * Pre-fill the ScreenEditor form from an existing record or the live game state.
 *
 * Geography is read as ids and written back as ids — there is no name in the
 * round trip to re-match, so renaming an area or a location cannot break the
 * prefill. The variant condition prefills too: it keys its check by id, which is
 * exactly what the record stores.
 */
import { isDungeonPalace } from '@shared/game/logic/queries/dungeon-values';
import { screenTagKeysOf } from '@shared/game/data';
import type {
  AreaId, InteriorKind, LocationId, ScreenKind, ScreenRecord, ScreenTag, VariantCondition,
} from '@shared/game/data';
import type { ScreenStatus } from '../../../../design-system/primitives';
import { dungeonGeographyFor } from './dungeon-geography';

interface PrefillSetters {
  setStep: (v: number) => void;
  setWriteError: (v: string | null) => void;
  setRandomizerName: (v: string) => void;
  setKind: (v: ScreenKind) => void;
  setWorld: (v: 'light' | 'dark') => void;
  setStatus: (v: ScreenStatus) => void;
  setAreaId: (v: AreaId | '') => void;
  setLocationId: (v: LocationId | '') => void;
  setPalaceIdx: (v: string) => void;
  setInteriorKind: (v: InteriorKind) => void;
  setFloor: (v: string) => void;
  setGridX: (v: string) => void;
  setGridY: (v: string) => void;
  setEntranceId: (v: string) => void;
  setSelectedTags: (v: ScreenTag[]) => void;
  setHasVariant: (v: boolean) => void;
  setVariantKey: (v: string) => void;
  setVariantLabel: (v: string) => void;
  setConditionType: (v: VariantCondition['type']) => void;
  setCondCheckId: (v: string) => void;
  setCondCheckCollected: (v: boolean) => void;
  setCondFlagAddr: (v: string) => void;
  setCondFlagBit: (v: string) => void;
  setCondFlagValue: (v: boolean) => void;
  setCondEntranceId: (v: string) => void;
  setCondProgressMin: (v: string) => void;
  setCondProgressMax: (v: string) => void;
}

interface ApplyPrefillArgs {
  existingScreen: ScreenRecord | null;
  gameState: { roomIndex: number; palaceIndex: number; isIndoors: boolean; isDarkWorld: boolean };
  set: PrefillSetters;
}

const num = (v: number | undefined): string => (v == null ? '' : String(v));

const clearVariant = (set: PrefillSetters): void => {
  set.setHasVariant(false);
  set.setVariantKey('');
  set.setVariantLabel('');
  set.setConditionType('always');
};

const applyVariant = (variant: NonNullable<ScreenRecord['variant']>, set: PrefillSetters): void => {
  set.setHasVariant(true);
  set.setVariantKey(variant.key);
  set.setVariantLabel(variant.label ?? '');
  const cond = variant.condition;
  set.setConditionType(cond.type);
  if (cond.type === 'check') { set.setCondCheckId(cond.id); set.setCondCheckCollected(cond.collected); }
  if (cond.type === 'flag') { set.setCondFlagAddr(String(cond.address)); set.setCondFlagBit(String(cond.bit)); set.setCondFlagValue(cond.value); }
  if (cond.type === 'entrance') set.setCondEntranceId(String(cond.id));
  if (cond.type === 'progress') {
    set.setCondProgressMin(num(cond.min));
    set.setCondProgressMax(num(cond.max));
  }
};

const fromRecord = (screen: ScreenRecord, set: PrefillSetters): void => {
  set.setRandomizerName(screen.randomizerName);
  set.setKind(screen.kind);
  set.setWorld(screen.world);
  set.setStatus(screen.status);
  set.setAreaId(screen.areaId);
  set.setLocationId(screen.locationId);
  set.setPalaceIdx(num(screen.gameId.palaceIndex));
  set.setInteriorKind(screen.interiorKind ?? 'cave');
  set.setFloor(num(screen.position?.floor));
  set.setGridX(num(screen.position?.gridX));
  set.setGridY(num(screen.position?.gridY));
  set.setEntranceId(num(screen.gameId.entranceId));
  set.setSelectedTags([...screenTagKeysOf(screen.tags)]);
  if (screen.variant) applyVariant(screen.variant, set);
  else clearVariant(set);
};

const fromGameState = (gameState: ApplyPrefillArgs['gameState'], set: PrefillSetters): void => {
  const isDungeon = isDungeonPalace(gameState.palaceIndex);
  set.setRandomizerName('');
  set.setKind(isDungeon ? 'dungeon' : 'interior');
  set.setStatus(undefined);
  set.setPalaceIdx(isDungeon ? String(gameState.palaceIndex) : '');
  const geography = isDungeon ? dungeonGeographyFor(gameState.palaceIndex) : null;
  if (geography) {
    set.setAreaId(geography.areaId);
    set.setLocationId(geography.locationId);
    set.setWorld(geography.world);
  } else {
    set.setWorld(gameState.isDarkWorld ? 'dark' : 'light');
    set.setAreaId('');
    set.setLocationId('');
  }
  set.setInteriorKind('cave');
  set.setFloor('');
  set.setGridX('');
  set.setGridY('');
  set.setEntranceId('');
  set.setSelectedTags([]);
  clearVariant(set);
};

const applyPrefill = (args: ApplyPrefillArgs) => {
  const { existingScreen, gameState, set } = args;
  set.setStep(0);
  set.setWriteError(null);
  if (existingScreen) fromRecord(existingScreen, set);
  else fromGameState(gameState, set);
};

export { applyPrefill };
export type { PrefillSetters };
