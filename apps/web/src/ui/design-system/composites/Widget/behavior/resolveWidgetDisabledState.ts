/* @layer renderer-components @kind logic */
/**
 * Resolves whether a widget should render behind a DisabledOverlay, and why: either Vanilla
 * Safe forcing off a readsGameData widget, or the widget's own requiresSetting gate being off.
 * When both apply, Vanilla Safe wins, because it is the less obvious cause: a user who
 * flipped their own requiresSetting off already knows why.
 */
import type { GameSettings } from '@shared/types/settings';
import { DISABLED_SETTING_MESSAGES } from '../../DisabledOverlay';
import type { WidgetDefinition } from '../Widget.type';

interface WidgetDisabledState {
  message: string;
  /** The GameSettings key responsible, for the overlay's deep-link. */
  settingId: string;
}

const messageFor = (settingId: string): string =>
  DISABLED_SETTING_MESSAGES[settingId] ?? `Disabled: ${settingId} is off`;

const resolveWidgetDisabledState = (
  def: WidgetDefinition | undefined,
  vanillaSafe: boolean,
  settings: GameSettings | null | undefined,
): WidgetDisabledState | null => {
  if (!def) return null;
  if (vanillaSafe && def.readsGameData) return { message: messageFor('vanillaSafe'), settingId: 'vanillaSafe' };
  if (def.requiresSetting && settings && !settings[def.requiresSetting]) {
    return { message: messageFor(def.requiresSetting), settingId: def.requiresSetting };
  }
  return null;
};

export { resolveWidgetDisabledState };
export type { WidgetDisabledState };
