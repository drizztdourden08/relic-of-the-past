/* @layer renderer-lib @kind logic */
/**
 * Which ROM's extracted sprite set the app should be pointed at.
 *
 * The active profile's ROM answers whenever there is one. When there is NOT —
 * a first run with no profile yet, a launch whose pinned profile was not found,
 * the moment before one is picked — the answer used to be "none", and nothing
 * activated a set at all: the shared base stayed on its built-in default and
 * the availability flag stayed false, so every view that draws item art showed
 * placeholders even though the files were on disk. The profile CREATION form is
 * exactly such a view (its randomizer panel lists the item pool with art), and
 * it cannot supply a ROM of its own until the person picks one.
 *
 * So a ROM that is ready to play stands in. The art is illustrative there — the
 * form is showing what the pool contains, not what one particular cartridge
 * looks like — and the moment a ROM IS chosen, useSpriteAvailability re-points
 * the set at it.
 */

/** The ROM whose sprite set should be active, or null when there is no ROM at all. */
const spriteRomOf = (
  activeRomFile: string | null | undefined, roms: readonly RomInfo[],
): string | null =>
  activeRomFile || roms.find((rom) => rom.hasAssets)?.romFile || roms[0]?.romFile || null;

export { spriteRomOf };
