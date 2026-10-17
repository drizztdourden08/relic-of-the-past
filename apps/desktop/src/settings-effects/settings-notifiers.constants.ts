/* @layer renderer-components @kind constants */
import { DEFAULT_FUNCTION_MAPPINGS } from '@rotp/features';
import { getInputManager } from '@app/game';
import type { SettingsNotifier } from './settings-notifiers.type';

const SETTINGS_NOTIFIERS: readonly SettingsNotifier[] = [
  { keys: ['windowMode'], run: (next, deps) => deps.onWindowModeChange?.(next.windowMode) },
  { keys: ['startFullscreen'], run: (next, deps) => deps.setFullscreen(Boolean(next.startFullscreen)) },
  {
    keys: ['viewportConstraint', 'aspectRatio'],
    run: (next, deps) => deps.onConstraintSettingsChange?.(next.viewportConstraint, next.aspectRatio),
  },
  { keys: ['displayPerfInTitle'], run: (next, deps) => deps.onDisplayPerfChange?.(next.displayPerfInTitle) },
  {
    keys: ['functionMappings'],
    run: (next) => getInputManager().setFunctionMappings(next.functionMappings ?? DEFAULT_FUNCTION_MAPPINGS),
  },
  {
    keys: ['enhancedSaveSlotShortcut', 'saveHoldDuration'],
    run: (next, deps) => deps.onSaveSlotSettingsChange?.(next.enhancedSaveSlotShortcut, next.saveHoldDuration),
  },
  { keys: ['overworldEdgeEffect'], run: (next, deps) => deps.onEdgeEffectChange?.(next.overworldEdgeEffect) },
  { keys: ['postProcessingShadows'], run: (next, deps) => deps.onShadowCastingChange?.(next.postProcessingShadows) },
  { keys: ['pixelPerfect'], run: (next, deps) => deps.onPixelPerfectChange?.(next.pixelPerfect) },
];

export { SETTINGS_NOTIFIERS };
