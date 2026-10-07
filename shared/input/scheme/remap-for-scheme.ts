/* @layer shared-input @kind logic */
/**
 * Strategy selector for the per-frame remap. One request shape, one result
 * shape, one lookup. The caller never branches on the scheme, and adding a
 * third scheme is a new entry in the table below instead of an edit to a
 * conditional at the call site.
 *
 * Both inputs are always supplied because both are cheap and the active
 * scheme can change between frames: `classicMask` is what the existing
 * polling engine computed from the profile's SNES mappings, `pressed` is
 * the same frame read as functions (see function-mask.ts).
 */
import { remapClassic } from './remap-classic';
import { remapModern } from './remap-modern';
import type { FunctionMask } from './function-mask';
import type { OwnsItem } from './remap-modern';
import type { ModernScheme } from '../../types/controls/scheme';
import type { ControlSchemeId, RemapResult } from './remap.type';

interface RemapRequest {
  scheme: ControlSchemeId;
  /** SNES mask from the profile's own console mappings (classic path). */
  classicMask: number;
  /** The same frame read as functions (modern path). */
  pressed: FunctionMask;
  /** Per-save slot assignments (modern path). */
  assignments: ModernScheme;
  /** Classic-only: Select opens the map, X opens the save prompt. */
  mapOnSelect: boolean;
  /**
   * Modern-only: does the live save hold this hud item? The remap is pure and has no
   * inventory, and an item slot pointing at something the save has never held must fire
   * nothing and must not move the core's one equipped-item register onto it.
   */
  ownsItem: OwnsItem;
}

type RemapStrategy = (request: RemapRequest) => RemapResult;

const STRATEGIES: Record<ControlSchemeId, RemapStrategy> = {
  classic: request => remapClassic(request.classicMask, { mapOnSelect: request.mapOnSelect }),
  modern: request => remapModern(request.pressed, request.assignments, request.ownsItem),
};

const remapForScheme = (request: RemapRequest): RemapResult => {
  return STRATEGIES[request.scheme](request);
};

export { remapForScheme };
export type { RemapRequest, RemapStrategy };
