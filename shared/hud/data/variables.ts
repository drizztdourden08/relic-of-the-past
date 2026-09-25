/* @layer shared-hud @kind data */
/**
 * The flat data surface every expression in a HUD document is evaluated
 * against. ONE table, enumerable, so a variable picker in the editor lists
 * itself off this file instead of off a copy someone forgot to update.
 *
 * Names follow the project's own convention - `<thing>_current` /
 * `<thing>_max` - and every one of them is a field the HUD already reads
 * (`HudVitalsContent`, `apps/web/src/ui/domains/hud/compounds/HudNodeRenderer/
 * HudNodeRenderer.type.ts`) or a count already carried alongside it. Nothing
 * here is writable: a layout OBSERVES the game, it never changes it.
 *
 * This file cannot import `HudVitalsContent` directly - `shared/*` is the
 * dependency leaf (docs/architecture/overview.md) and that type lives under
 * `apps/web/*`. `HudVitalsSource` below names the same fields structurally, so
 * a real `HudVitalsContent` value satisfies it with no adapter and no risk of
 * the two drifting in shape without `tsc` noticing.
 */

/** One entry in the table: a name a document may bind to, and what it means. */
interface HudVariableDef {
  name: string;
  note: string;
}

const HUD_VARIABLES: readonly HudVariableDef[] = [
  { name: 'life_current', note: 'Eighths - one heart is 8. 0 to life_max.' },
  { name: 'life_max', note: 'Capacity, also in eighths. 8-160 (20 containers = 160).' },
  { name: 'magic_current', note: 'Raw magic power. 0-128, a full bar.' },
  { name: 'magic_max', note: 'Constant 128 today; present so a layout never hard-codes it.' },
  { name: 'half_magic', note: '0 or 1 - the upgrade is owned.' },
  { name: 'armor', note: '0-2 - green, blue, red. Drives the heart tint.' },
  { name: 'arrow_current', note: '0 to arrow_max.' },
  { name: 'arrow_max', note: '30-70.' },
  { name: 'bomb_current', note: '0 to bomb_max.' },
  { name: 'bomb_max', note: '10-50.' },
  { name: 'key_current', note: 'Small keys for the current dungeon. 0-99.' },
  { name: 'rupee_current', note: '0 to rupee_max.' },
  { name: 'rupee_max', note: 'Wallet tier: 99, 999 or 9999.' },
  { name: 'silver_arrows', note: '0 or 1.' },
  { name: 'slot_count', note: 'How many slots the active scheme has.' },
];

const HUD_VARIABLE_NAMES: ReadonlySet<string> = new Set(HUD_VARIABLES.map((entry) => entry.name));

/**
 * Only meaningful INSIDE a `repeat` - not table entries, because they have no
 * value outside one, but named here so the type of "a name a picker may offer"
 * can include them when the picker knows it is inside a repeat's scope.
 */
const HUD_SCOPE_EXTRAS = ['index', 'count', 'item'] as const;
type HudScopeExtra = (typeof HUD_SCOPE_EXTRAS)[number];

const HUD_SCOPE_EXTRA_NAMES: ReadonlySet<string> = new Set(HUD_SCOPE_EXTRAS);

const isHudVariableName = (name: string): boolean => HUD_VARIABLE_NAMES.has(name);
const isHudScopeExtra = (name: string): name is HudScopeExtra => HUD_SCOPE_EXTRA_NAMES.has(name);

/** Every name a document may bind to, for the picker: the table, plus the
 *  scope extras only when the field being edited is inside a `repeat`. */
const hudVariableNamesFor = (context: { insideRepeat: boolean }): readonly string[] =>
  context.insideRepeat ? [...HUD_VARIABLES.map((entry) => entry.name), ...HUD_SCOPE_EXTRAS] : HUD_VARIABLES.map((entry) => entry.name);

/** The same fields `HudVitalsContent` carries, named structurally so this
 *  leaf file never imports the renderer's type. */
interface HudVitalsSource {
  healthCurrent: number;
  healthCapacity: number;
  magic: number;
  halfMagic: boolean;
  armor: number;
  arrows: number;
  maxArrows: number;
  bombs: number;
  maxBombs: number;
  keys: number;
  rupees: number;
  maxRupees: number;
  hasSilverArrows: boolean;
}

/**
 * Builds the scope object every expression in a plain (non-repeat) field is
 * evaluated against. `slotCount` is not part of the vitals - it is the size of
 * whatever slot-content map the caller already holds (`Object.keys(slots)
 * .length`), passed in instead of re-derived so this file invents no new
 * plumbing of its own.
 */
const hudDataScope = (vitals: HudVitalsSource, slotCount: number): Record<string, number> => ({
  life_current: vitals.healthCurrent,
  life_max: vitals.healthCapacity,
  magic_current: vitals.magic,
  magic_max: 128,
  half_magic: vitals.halfMagic ? 1 : 0,
  armor: vitals.armor,
  arrow_current: vitals.arrows,
  arrow_max: vitals.maxArrows,
  bomb_current: vitals.bombs,
  bomb_max: vitals.maxBombs,
  key_current: vitals.keys,
  rupee_current: vitals.rupees,
  rupee_max: vitals.maxRupees,
  silver_arrows: vitals.hasSilverArrows ? 1 : 0,
  slot_count: slotCount,
});

/** Levenshtein distance, capped - this only ever compares short identifiers
 *  against a table of ~15 names, so no larger algorithm earns its keep here. */
const editDistance = (a: string, b: string): number => {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_unused, i) => [i, ...Array(cols - 1).fill(0)]);
  for (let j = 1; j < cols; j += 1) d[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[rows - 1][cols - 1];
};

/** "Did you mean X?" for an unknown-variable error. Only offers a name close
 *  enough to plausibly be a typo; otherwise there is nothing honest to suggest. */
const suggestVariableName = (name: string, insideRepeat: boolean): string | undefined => {
  const candidates = hudVariableNamesFor({ insideRepeat });
  let best: string | undefined;
  let bestDistance = Infinity;
  candidates.forEach((candidate) => {
    const distance = editDistance(name, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  });
  const threshold = Math.max(2, Math.floor(name.length / 3));
  return best !== undefined && bestDistance <= threshold ? best : undefined;
};

export {
  HUD_SCOPE_EXTRAS, HUD_VARIABLES, hudDataScope, hudVariableNamesFor, isHudScopeExtra, isHudVariableName,
  suggestVariableName,
};
export type { HudScopeExtra, HudVariableDef, HudVitalsSource };
