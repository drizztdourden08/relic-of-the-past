/**
 * Pure helper functions for the enhanced save slot state machine.
 *
 * Contains pause-guard logic, binding resolution, and hint builders.
 */

import { getInputManager, resolveFunctionMappingIcon } from '../../../../lib/game';
import type { FunctionAction, FunctionMapping } from '@shared/types/controls';
import { getBindingLabel, getBindingIconUrl } from '../../../views/ProfileHub/tabs/controls/BindingRow';
import { keyCodeToIconId, getButtonIconUrl } from '../../../views/InputTester/data/button-icons';
import type { SlotHint } from './enhanced-save-slot.types';

/**
 * Wrap a save/load action with pause handling: if game is paused, unpause first,
 * do the action, then re-pause.
 */
async function withPauseGuard(action: () => Promise<boolean>): Promise<boolean> {
  const inputMgr = getInputManager();
  const wasPaused = inputMgr.isPaused();
  if (wasPaused) {
    inputMgr.resume();
    await new Promise(r => requestAnimationFrame(r));
  }
  const result = await action();
  if (wasPaused) {
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    inputMgr.togglePause();
  }
  return result;
}

/** Look up the binding for a slot's load action from function mappings */
function getSlotBinding(mappings: FunctionMapping[], slot: number): { label: string; iconUrl: string | null } {
  const loadAction = `load-state-${slot + 1}` as FunctionAction;
  const loadMapping = mappings.find(m => m.action === loadAction && m.binding.type !== 'none');
  if (loadMapping) {
    const icon = loadMapping.icon ?? resolveFunctionMappingIcon(loadMapping);
    return {
      label: getBindingLabel(loadMapping.binding, icon),
      iconUrl: getBindingIconUrl(loadMapping.binding, icon),
    };
  }
  const saveAction = `save-state-${slot + 1}` as FunctionAction;
  const saveMapping = mappings.find(m => m.action === saveAction && m.binding.type !== 'none');
  if (saveMapping) {
    const icon = saveMapping.icon ?? resolveFunctionMappingIcon(saveMapping);
    return {
      label: getBindingLabel(saveMapping.binding, icon),
      iconUrl: getBindingIconUrl(saveMapping.binding, icon),
    };
  }
  return { label: `Slot ${slot + 1}`, iconUrl: null };
}

/** Get ESC key icon */
function getEscBinding(): { label: string; iconUrl: string | null } {
  const iconId = keyCodeToIconId('Escape');
  return {
    label: 'Esc',
    iconUrl: iconId ? getButtonIconUrl(iconId) : null,
  };
}

/** Build idle hints from actual bindings */
function buildIdleHints(mappings: FunctionMapping[], slot: number): SlotHint[] {
  const slotInfo = getSlotBinding(mappings, slot);
  const escInfo = getEscBinding();
  return [
    { action: 'tap-load', keyLabel: slotInfo.label, iconUrl: slotInfo.iconUrl },
    { action: 'hold-save', keyLabel: slotInfo.label, iconUrl: slotInfo.iconUrl },
    { action: 'esc-cancel', keyLabel: escInfo.label, iconUrl: escInfo.iconUrl },
  ];
}

/** Hints while holding */
function buildHoldingHints(mappings: FunctionMapping[], slot: number): SlotHint[] {
  const slotInfo = getSlotBinding(mappings, slot);
  return [
    { action: 'holding-save', keyLabel: slotInfo.label, iconUrl: slotInfo.iconUrl },
  ];
}

export { withPauseGuard, getSlotBinding, getEscBinding, buildIdleHints, buildHoldingHints };
