/* @layer shared-game @kind types */
/**
 * How much of a seed has to be reachable for it to count as valid: the
 * source's `accessibility` choice (Archipelago worlds/alttp/Options.py, and
 * BaseClasses.MultiWorld.fulfills_accessibility, which is what the three
 * values actually mean):
 *
 * - full:    every location must be reachable. This app's baseline, and the
 *             only contract the generator had before the option was read.
 * - items:   every location holding an ADVANCEMENT item must be reachable
 *             (so nothing that matters is lost), and the goal must be
 *             reachable. A junk location may stay shut.
 * - minimal: only the goal must be reachable; any location may stay shut.
 */

type AccessibilityMode = 'full' | 'items' | 'minimal';

export type { AccessibilityMode };
