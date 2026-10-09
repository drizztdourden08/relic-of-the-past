/* @layer shared-input @kind constants */
import { remapClassic } from './remap-classic';
import { remapModern } from './remap-modern';
import type { RemapStrategy } from './remap-for-scheme.type';
import type { ControlSchemeId } from '@rotp/features';

const STRATEGIES: Record<ControlSchemeId, RemapStrategy> = {
  classic: request => remapClassic(request.classicMask, { mapOnSelect: request.mapOnSelect }),
  modern: request => remapModern(request.pressed, request.assignments, request.ownsItem),
};

export { STRATEGIES };
