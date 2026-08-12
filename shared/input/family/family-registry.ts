/* @layer shared-input @kind logic */
/**
 * Family registry, self-registration pattern. A family file imports this
 * and calls registerFamily() for itself; lookup is a plain map keyed by
 * SdlGamepadType. Adding a family is a new file plus one import in
 * index.ts, never an edit to a dispatcher or a switch statement here.
 */

import type { FamilyMetadata, SdlGamepadType } from './family.type';

const registry = new Map<SdlGamepadType, FamilyMetadata>();

/** A family with no data at all, used only if a type is looked up before
 *  any family (including generic) has registered. Keeps findFamily total. */
const EMPTY_FAMILY: FamilyMetadata = { types: [] };

const registerFamily = (metadata: FamilyMetadata): void => {
  for (const type of metadata.types) {
    registry.set(type, metadata);
  }
};

/**
 * Lookup by SDL gamepad type. Every member of SdlGamepadType is claimed by
 * exactly one registered family (generic claims 'standard' and 'unknown'),
 * so this always answers with real metadata once index.ts has run its
 * family imports; the fallback below only guards against an out-of-order
 * import during tests, so a caller never has to branch on a missing family.
 */
const findFamily = (sdlType: SdlGamepadType): FamilyMetadata => {
  return registry.get(sdlType) ?? registry.get('unknown') ?? EMPTY_FAMILY;
};

export { findFamily, registerFamily };
