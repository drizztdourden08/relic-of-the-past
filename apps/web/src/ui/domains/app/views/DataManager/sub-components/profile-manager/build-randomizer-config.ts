/* @layer renderer-components @kind logic */
/**
 * Builds the creation-time ProfileRandomizerConfig from the creation form's
 * randomizer fields. A blank seed becomes a random hex seed HERE, at create
 * time, so the profile always records the exact seed it was generated with.
 * The options field freezes the ENTIRE catalog snapshot (schema v2) —
 * baselines plus the choices the form exposes, read through the ONE
 * choices → overrides reading the live panel also uses, so a row wired into
 * one of them can never be missing from the other. The form STARTS on the
 * catalog baselines: every plain switch is read off them, and every block
 * starts on the same DEFAULT setting its catalog rows are written from, so a
 * fresh form freezes exactly the snapshot a bare catalog freeze would. A
 * Custom wallet pins the larger rupee ceiling on the profile, since the
 * wallet ladder only ever lowers that setting's cap.
 */
import type { ProfileRandomizerConfig } from '@shared/types/profile';
import { DEFAULT_CAPACITY_BONUS, DEFAULT_CAPACITY_PROFILE } from '@shared/randomizer/ap-world/capacity';
import { DEFAULT_POND_SETTING } from '@shared/randomizer/ap-world/pond/pond-profile-defaults';
import { defaultShopScope } from '@shared/randomizer/ap-world/shops/shop-scope-from-values';
import { DEFAULT_DARK_ROOM_SETTING } from '@shared/randomizer/ap-world/dark-rooms/dark-room-lights.data';
import { defaultDifficulty } from '@shared/randomizer/ap-world/difficulty/difficulty-from-snapshot';
import { DEFAULT_ITEM_POWER } from '@shared/randomizer/ap-world/item-power/item-power.data';
import { defaultProgressiveSetting } from '@shared/randomizer/ap-world/progressive/progressive-from-snapshot';
import { defaultProgressiveModes } from '@shared/randomizer/ap-world/progressive/progressive-modes.data';
import { defaultRetroBow } from '@shared/randomizer/ap-world/retro/retro-from-snapshot';
import { DEFAULT_ACCESSIBILITY } from '@shared/randomizer/ap-world/accessibility/accessibility-from-snapshot';
import { apBaselineValues } from '@shared/randomizer/ap-world/options.data';
import { INCLUDE_NPC_CHECKS_KEY, INCLUDE_WORLD_ITEMS_KEY } from '@shared/randomizer/ap-world/scope-option-keys';
import { buildOptionsSnapshot } from '@shared/randomizer/options-snapshot';
import { randomizerChoiceOverrides } from '@app/hooks/randomizer/randomizer-choices';
import { DEFAULT_DUNGEON_ITEM_SETTING } from '@shared/randomizer/ap-world/dungeon-items/dungeon-item-modes';
import type { RandomizerOptionChoices } from '@app/hooks/randomizer/randomizer-choices';

/** The connection fields plus every catalog choice the options panel edits. */
interface RandomizerFormState extends RandomizerOptionChoices {
  enabled: boolean;
  seed: string;
  mode: 'local' | 'online';
  serverUrl: string;
  slotName: string;
}

/** A plain switch starts where its catalog row's baseline says. */
const baselineSwitch = (key: string): boolean => apBaselineValues[key] === true;

/** The form as a new profile first sees it: the catalog baselines, block by block. */
const EMPTY_RANDOMIZER_FORM: RandomizerFormState = {
  enabled: false, seed: '', mode: 'local', serverUrl: '', slotName: '',
  keyDropShuffle: baselineSwitch('key_drop_shuffle'),
  includeNpcChecks: baselineSwitch(INCLUDE_NPC_CHECKS_KEY),
  includeWorldItems: baselineSwitch(INCLUDE_WORLD_ITEMS_KEY),
  shufflePrizes: baselineSwitch('dungeon_prize_shuffle'),
  // Every dungeon's own keys, maps and compasses start where they always were.
  bigKeyShuffle: DEFAULT_DUNGEON_ITEM_SETTING.bigKey,
  smallKeyShuffle: DEFAULT_DUNGEON_ITEM_SETTING.smallKey,
  compassShuffle: DEFAULT_DUNGEON_ITEM_SETTING.compass,
  mapShuffle: DEFAULT_DUNGEON_ITEM_SETTING.map,
  // Every slot ticked but the hut's, shuffled as exactly that set; the price rows start on their baselines.
  shops: defaultShopScope(), shopPrices: {},
  // The whole capacity feature is on for a new profile, on the fresh-profile ladders.
  capacityEnabled: true,
  capacity: DEFAULT_CAPACITY_PROFILE,
  capacityProgressive: true,
  capacityBonus: DEFAULT_CAPACITY_BONUS,
  pond: DEFAULT_POND_SETTING,
  // Every tier of every family ships, and the items behave as they always have.
  progressiveTiers: defaultProgressiveSetting(),
  // Every family climbs its ladder in order, which is how the seed has always
  // been rolled; arrows are found rather than bought.
  progressiveModes: defaultProgressiveModes(),
  retroBow: defaultRetroBow(),
  itemPower: DEFAULT_ITEM_POWER,
  // Every family carries the copies it always carried, and the hearts climb to
  // the ceiling the game itself enforces.
  difficulty: defaultDifficulty(),
  // A new profile asks for the strictest contract: every location reachable.
  accessibility: DEFAULT_ACCESSIBILITY,
  // Dark rooms start lit, and every one of the four lights counts.
  darkRoomLightRequired: DEFAULT_DARK_ROOM_SETTING.requireLight,
  darkRoomLightLamp: DEFAULT_DARK_ROOM_SETTING.lights.lamp,
  darkRoomLightFireRod: DEFAULT_DARK_ROOM_SETTING.lights.fireRod,
  darkRoomLightBombos: DEFAULT_DARK_ROOM_SETTING.lights.bombos,
  darkRoomLightRedCane: DEFAULT_DARK_ROOM_SETTING.lights.redCane,
};

const randomSeed = (): string => {
  const bytes = globalThis.crypto?.getRandomValues?.(new Uint8Array(8));
  if (bytes) return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return Date.now().toString(16);
};

const buildRandomizerConfig = (form: RandomizerFormState): ProfileRandomizerConfig | undefined => {
  if (!form.enabled) return undefined;
  const config: ProfileRandomizerConfig = {
    mode: form.mode,
    seed: form.seed.trim() || randomSeed(),
    options: buildOptionsSnapshot(randomizerChoiceOverrides(form)),
  };
  if (form.capacity.wallet.mode === 'custom') config.frozenSettings = { carryMoreRupees: true };
  if (form.mode === 'online') {
    if (form.serverUrl.trim()) config.serverUrl = form.serverUrl.trim();
    if (form.slotName.trim()) config.slotName = form.slotName.trim();
  }
  return config;
};

export { buildRandomizerConfig, EMPTY_RANDOMIZER_FORM };
export type { RandomizerFormState };
