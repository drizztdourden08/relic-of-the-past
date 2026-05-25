/**
 * Requirement Detector — determines which items gate access to each connection point.
 *
 * Strategy: flood the screen multiple times with different inventories.
 * Compare which border tiles become reachable with each item added.
 * The minimal item set needed to reach a tile = its requirements.
 */

import type { RomData } from '../../../asset-extraction/rom/rom-types';
import type { RequirementSet, TraversalRequirement } from '../plan/navigation-data.types';
import { floodFillScreen } from '../flood-fill';
import { findBorderBundles, type BorderBundle } from './border-bundles';

/** Items tested in order of unlock frequency */
const ITEM_PROGRESSION: TraversalRequirement[] = [
  'lift.1', 'lift.2', 'boots', 'flippers', 'hammer', 'hookshot', 'bombs',
  'sword', 'boomerang', 'mirror', 'firerod', 'lamp',
];

/**
 * For a given screen, determine which bundles require which items.
 * Returns a map: bundleId → RequirementSet
 */
export function detectRequirements(
  rom: RomData,
  screenIndex: number,
): Map<string, RequirementSet> {
  const results = new Map<string, RequirementSet>();

  // Flood with no items — baseline
  const baseResult = floodFillScreen(rom, screenIndex);
  const baseBundles = findBorderBundles(baseResult);

  // Mark all base bundles as no-requirement
  for (const b of baseBundles) {
    results.set(b.id, []);
  }

  // Test each item individually
  for (const item of ITEM_PROGRESSION) {
    const inv = new Set<string>([item]);
    const itemResult = floodFillScreen(rom, screenIndex, inv);
    const itemBundles = findBorderBundles(itemResult);

    // Find bundles that are NEW (not in base)
    for (const ib of itemBundles) {
      if (!results.has(ib.id)) {
        // This bundle only exists with this item
        results.set(ib.id, [[item]]);
      }
    }
  }

  // Test item combinations for bundles still not found
  // (e.g., needs lift.1 + hammer together)
  // TODO: implement combinatorial testing for complex requirements

  return results;
}
