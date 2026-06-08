/* @layer renderer-widgets @kind logic */
/** Pre-fill the ScreenEditor form from an existing screen or the live game state. */
import type { ScreenDefinition, ScreenType, InteriorKind, VariantCondition } from '@shared/game/types';
import type { ScreenStatus } from '../../../components/primitives';
import type { ScreenTag } from '@shared/game/data/screens/tags';
import { DUNGEON_META, getDungeonName } from '@shared/game/data/screens/game-values';

interface PrefillSetters {
  setStep: (v: number) => void;
  setWriteError: (v: string | null) => void;
  setName: (v: string) => void;
  setType: (v: ScreenType) => void;
  setWorld: (v: 'light' | 'dark') => void;
  setStatus: (v: ScreenStatus) => void;
  setAreaId: (v: string) => void;
  setLocationId: (v: string) => void;
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
  setCondCheckName: (v: string) => void;
  setCondCheckCollected: (v: boolean) => void;
  setCondFlagAddr: (v: string) => void;
  setCondFlagBit: (v: string) => void;
  setCondFlagValue: (v: boolean) => void;
  setCondEntranceId: (v: string) => void;
  setCondProgressMin: (v: string) => void;
  setCondProgressMax: (v: string) => void;
}

interface ApplyPrefillArgs {
  existingScreen: ScreenDefinition | null;
  gameState: { roomIndex: number; palaceIndex: number; isIndoors: boolean; isDarkWorld: boolean };
  localAreas: { id: string; name: string; world: string }[];
  localLocations: { id: string; name: string; areaId: string }[];
  set: PrefillSetters;
}

const applyPrefill = (args: ApplyPrefillArgs) => {
  const { existingScreen, gameState, localAreas, localLocations, set } = args;

  set.setStep(0);
  set.setWriteError(null);

  if (existingScreen) {
    set.setName(existingScreen.name);
    set.setType(existingScreen.type);
    set.setWorld(existingScreen.world);
    set.setStatus(existingScreen.status);
    // For dungeons, palace index is the primary — area/location derived from meta
    if (existingScreen.type === 'dungeon') {
      set.setPalaceIdx(String(existingScreen.dungeon.palaceIndex));
      const derivedName = getDungeonName(existingScreen.dungeon.palaceIndex);
      const meta = DUNGEON_META[derivedName];
      if (meta) {
        set.setAreaId(meta.areaId);
        set.setLocationId(meta.locationId);
        set.setWorld(meta.world);
      } else {
        const matchedLoc = localLocations.find(l => l.name === existingScreen.location || l.id === existingScreen.location);
        set.setLocationId(matchedLoc?.id ?? existingScreen.location);
        const matchedArea = localAreas.find(a => a.name === existingScreen.area || a.id === existingScreen.area);
        set.setAreaId(matchedArea?.id ?? matchedLoc?.areaId ?? existingScreen.area);
      }
    } else {
      set.setPalaceIdx('');
      const matchedLoc = localLocations.find(l => l.name === existingScreen.location || l.id === existingScreen.location);
      set.setLocationId(matchedLoc?.id ?? existingScreen.location);
      const matchedArea = localAreas.find(a => a.name === existingScreen.area || a.id === existingScreen.area);
      set.setAreaId(matchedArea?.id ?? matchedLoc?.areaId ?? existingScreen.area);
    }
    set.setInteriorKind(existingScreen.type === 'interior' ? existingScreen.interior.kind : 'cave');
    set.setFloor(existingScreen.type === 'dungeon' && existingScreen.dungeon.floor != null ? String(existingScreen.dungeon.floor) : '');
    set.setGridX(existingScreen.type === 'dungeon' && existingScreen.dungeon.gridX != null ? String(existingScreen.dungeon.gridX) : existingScreen.type === 'overworld' ? String(existingScreen.overworld.gridX) : '');
    set.setGridY(existingScreen.type === 'dungeon' && existingScreen.dungeon.gridY != null ? String(existingScreen.dungeon.gridY) : existingScreen.type === 'overworld' ? String(existingScreen.overworld.gridY) : '');
    set.setEntranceId(existingScreen.entranceId != null ? String(existingScreen.entranceId) : '');
    set.setSelectedTags([...existingScreen.tags]);
    // Variant pre-fill
    if (existingScreen.variant) {
      set.setHasVariant(true);
      set.setVariantKey(existingScreen.variant.key);
      set.setVariantLabel(existingScreen.variant.label ?? '');
      const cond = existingScreen.variant.condition;
      set.setConditionType(cond.type);
      if (cond.type === 'check') { set.setCondCheckName(cond.name); set.setCondCheckCollected(cond.collected); }
      if (cond.type === 'flag') { set.setCondFlagAddr(String(cond.address)); set.setCondFlagBit(String(cond.bit)); set.setCondFlagValue(cond.value); }
      if (cond.type === 'entrance') { set.setCondEntranceId(String(cond.id)); }
      if (cond.type === 'progress') { set.setCondProgressMin(cond.min != null ? String(cond.min) : ''); set.setCondProgressMax(cond.max != null ? String(cond.max) : ''); }
    } else {
      set.setHasVariant(false);
      set.setVariantKey('');
      set.setVariantLabel('');
      set.setConditionType('always');
    }
  } else {
    // Auto-generate from game state
    set.setName('');
    const isDungeon = gameState.palaceIndex <= 0x1A;
    set.setType(isDungeon ? 'dungeon' : 'interior');
    set.setStatus(undefined);
    set.setPalaceIdx(isDungeon ? String(gameState.palaceIndex) : '');
    // Dungeon: derive area/location from meta
    if (isDungeon) {
      const derivedName = getDungeonName(gameState.palaceIndex);
      const meta = DUNGEON_META[derivedName];
      if (meta) {
        set.setAreaId(meta.areaId);
        set.setLocationId(meta.locationId);
        set.setWorld(meta.world);
      } else {
        set.setWorld(gameState.isDarkWorld ? 'dark' : 'light');
        set.setAreaId('');
        set.setLocationId('');
      }
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
    set.setHasVariant(false);
    set.setVariantKey('');
    set.setVariantLabel('');
    set.setConditionType('always');
  }
};

export { applyPrefill };
export type { PrefillSetters };
