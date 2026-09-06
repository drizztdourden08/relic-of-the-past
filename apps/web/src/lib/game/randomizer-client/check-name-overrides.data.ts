/* @layer bridge-wasm @kind data */
/**
 * Community-standard location names that differ from the derived
 * `<dungeon> - <check>` default. Keyed by the derived default name.
 */

const CHECK_NAME_OVERRIDES: Record<string, string> = {
  'Hyrule Castle - Dark Cross': 'Sewers - Dark Cross',
  'Hyrule Castle - Secret Room - Left': 'Sewers - Secret Room - Left',
  'Hyrule Castle - Secret Room - Middle': 'Sewers - Secret Room - Middle',
  'Hyrule Castle - Secret Room - Right': 'Sewers - Secret Room - Right',
  'Hyrule Castle - Sanctuary': 'Sanctuary',
  'Hyrule Castle - Key Rat Key Drop': 'Sewers - Key Rat Key Drop',
};

export { CHECK_NAME_OVERRIDES };
