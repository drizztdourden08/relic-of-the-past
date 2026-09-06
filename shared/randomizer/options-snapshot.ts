/* @layer shared-game @kind logic */
/**
 * The frozen option snapshot recorded on a randomized profile, and the
 * tolerance layer around it. buildOptionsSnapshot freezes the whole catalog
 * (baselines plus the caller's unlocked choices); normalizeRandomizerOptions
 * accepts the v2 snapshot, the v1 snapshot (one capacity toggle, adapted
 * onto the Custom values that reproduce its pool exactly, so a live seed
 * regenerates its placement) and the pre-snapshot config shape
 * ({ mode, accessibility, randomizedKinds }) that older profiles carry;
 * toLegacyOptions derives the option shape the legacy generator consumes.
 * The progressive capacity switch is on for a NEW profile only: a stored
 * snapshot without the key, a v1 snapshot and the pre-v2 boolean spelling
 * all read as off, so their placements keep matching their fixed-jump pools.
 * The same holds for every row whose fresh baseline has moved away from the
 * reading it shipped with (legacy-absent-rows.data.ts): a stored snapshot
 * missing such a row reads the shipped value, never today's baseline.
 */
import { apBaselineValues, apOptionByKey } from './ap-world/options.data';
import { CAPACITY_PROGRESSIVE_KEY, LEGACY_CAPACITY_KEY } from './ap-world/capacity/capacity-option-keys';
import { legacyCapacityProfile } from './ap-world/capacity/capacity-profile-defaults';
import { capacityValuesOf } from './ap-world/capacity/capacity-profile-from-snapshot';
import { POST_LEGACY_SHOP_SLOT_KEYS, SHOP_MODE_KEY } from './ap-world/shops/shop-slot-options.data';
import { LEGACY_ABSENT_ROWS } from './legacy-absent-rows.data';
import type { ApOptionValue, RandomizerOptionsSnapshot } from './ap-world/options.type';
import type { RandomizedKind, RandomizerOptions } from './placement.type';

const OPTIONS_SCHEMA = 'ap-options-v2';
const LEGACY_SCHEMA = 'ap-options-v1';

type Values = Record<string, ApOptionValue>;

/** The v1 spelling: a bare boolean toggle ⇒ the profile it stood for (see capacity-profile-defaults.ts), fixed jumps. */
const legacyCapacityRows = (toggle: ApOptionValue | undefined): Values | undefined =>
  (typeof toggle === 'boolean'
    ? { ...capacityValuesOf(legacyCapacityProfile(toggle)), [CAPACITY_PROGRESSIVE_KEY]: false }
    : undefined);

/**
 * Full catalog freeze; overrides apply only to unlocked options. A boolean
 * shuffle_capacity_upgrades override is the pre-v2 spelling and lands as the
 * capacity rows it stood for.
 */
const buildOptionsSnapshot = (
  overrides: Readonly<Record<string, ApOptionValue>> = {},
): RandomizerOptionsSnapshot => {
  const values: Values = { ...apBaselineValues, ...legacyCapacityRows(overrides[LEGACY_CAPACITY_KEY]) };
  for (const [key, value] of Object.entries(overrides)) {
    const option = apOptionByKey.get(key);
    if (option && !option.locked) values[key] = value;
  }
  return { schema: OPTIONS_SCHEMA, values };
};

const isSnapshotOf = (raw: unknown, schema: string): raw is { schema: string; values: Values } => {
  if (!raw || typeof raw !== 'object') return false;
  const candidate = raw as Partial<RandomizerOptionsSnapshot>;
  return candidate.schema === schema
    && typeof candidate.values === 'object' && candidate.values !== null;
};

const isOptionsSnapshot = (raw: unknown): raw is RandomizerOptionsSnapshot => isSnapshotOf(raw, OPTIONS_SCHEMA);

const isLegacyOptionsSnapshot = (raw: unknown): boolean => isSnapshotOf(raw, LEGACY_SCHEMA);

/**
 * Scope-split migration: a snapshot frozen before include_world_items
 * existed used include_npc_checks for BOTH surfaces, so the missing key
 * follows the npc toggle, so a live profile keeps its exact scope.
 */
const withScopeSplit = (values: Values, raw: Values): Values => {
  if ('include_world_items' in raw) return values;
  return { ...values, include_world_items: raw['include_npc_checks'] === true };
};

/**
 * A snapshot frozen before the shuffle mode existed asked for its shop slots
 * in ONE way: the first N of the fifteen shelf slots that shipped then. So the
 * missing mode key reads as Sequential, and every slot added since (the split
 * doors, the hut, the bomb counter) reads as unticked, whatever its own
 * baseline says. The stored count then opens exactly the slots it always
 * opened, and the placement stays valid.
 */
const withShopLegacyDefault = (values: Values, raw: Values): Values => {
  if (SHOP_MODE_KEY in raw) return values;
  const offRows = Object.fromEntries(POST_LEGACY_SHOP_SLOT_KEYS.map((key) => [key, false]));
  return { ...values, ...offRows, [SHOP_MODE_KEY]: 'sequential' };
};

/** A snapshot frozen before the progressive switch existed played fixed-jump items: the missing key reads off. */
const withProgressiveDefault = (values: Values, raw: Values): Values =>
  (CAPACITY_PROGRESSIVE_KEY in raw ? values : { ...values, [CAPACITY_PROGRESSIVE_KEY]: false });

/** Every row the stored snapshot lacks whose baseline has since moved reads the value it shipped with. */
const withLegacyAbsentRows = (values: Values, raw: Values): Values => {
  const next = { ...values };
  for (const [key, value] of Object.entries(LEGACY_ABSENT_ROWS)) if (!(key in raw)) next[key] = value;
  return next;
};

/** The baselines under a stored snapshot's own rows, with every absent row reading as it shipped. */
const overBaselines = (raw: Values): Values => withLegacyAbsentRows({ ...apBaselineValues, ...raw }, raw);

/** v1 → v2: the retired toggle becomes the Custom values that reproduce the v1 pool exactly. */
const adaptV1 = (raw: Values): Values => {
  const { [LEGACY_CAPACITY_KEY]: retired, ...rest } = raw;
  return withScopeSplit(withShopLegacyDefault({
    ...overBaselines(rest),
    ...capacityValuesOf(legacyCapacityProfile(retired === true)),
    [CAPACITY_PROGRESSIVE_KEY]: false,
  }, raw), raw);
};

/**
 * Accepts whatever a stored profile carries. A v2 snapshot passes through
 * with missing keys back-filled from the baselines (so a snapshot written
 * before a catalog addition stays complete); a v1 snapshot is adapted; the
 * legacy shape maps onto the baselines with its one recoverable choice
 * (whether key drops were randomized).
 */
const normalizeRandomizerOptions = (raw: unknown): RandomizerOptionsSnapshot => {
  if (isSnapshotOf(raw, OPTIONS_SCHEMA)) {
    const values = withShopLegacyDefault(
      withProgressiveDefault(overBaselines(raw.values), raw.values), raw.values,
    );
    return { schema: OPTIONS_SCHEMA, values: withScopeSplit(values, raw.values) };
  }
  if (isSnapshotOf(raw, LEGACY_SCHEMA)) return { schema: OPTIONS_SCHEMA, values: adaptV1(raw.values) };
  const legacy = raw as { randomizedKinds?: readonly string[] } | null | undefined;
  const kinds = legacy?.randomizedKinds;
  const keyDrop = Array.isArray(kinds) ? kinds.includes('keyDrop') : true;
  // The pre-snapshot shape stored no rows at all, so every row reads as it shipped.
  const fresh = buildOptionsSnapshot({ key_drop_shuffle: keyDrop });
  return { schema: OPTIONS_SCHEMA, values: withLegacyAbsentRows(fresh.values, {}) };
};

/** The option shape the generator consumes until it reads the snapshot itself. */
const toLegacyOptions = (snapshot: RandomizerOptionsSnapshot): RandomizerOptions => {
  const kinds: RandomizedKind[] = ['chest'];
  if (snapshot.values['key_drop_shuffle'] !== false) kinds.push('keyDrop');
  return { mode: 'standard', accessibility: 'items', randomizedKinds: kinds };
};

export {
  LEGACY_SCHEMA,
  OPTIONS_SCHEMA,
  buildOptionsSnapshot,
  isLegacyOptionsSnapshot,
  isOptionsSnapshot,
  normalizeRandomizerOptions,
  toLegacyOptions,
};
