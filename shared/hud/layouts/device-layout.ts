/* @layer shared-hud @kind logic */
/**
 * Which shipped layout a freshly dropped device starts wearing.
 *
 * A control scheme names the HUD layout it wears (`ModernBindings.layoutId`),
 * and a scheme that has just been prefilled from a device has to name
 * something. Otherwise dropping a pad would give the player a slot list with
 * no HUD to see it in until they went looking for a setting.
 *
 * IT IS A PREFILL AND NOTHING MORE. What lands on the profile is editable from
 * that moment: the controls screen's layout picker changes it, the editor's
 * "save a copy" points it at a fork, and nothing re-derives it behind the
 * player. That is the same rule the slot list follows, and the two are written
 * in the same breath for the same reason.
 *
 * Both device kinds start on the same shipped arrangement today, because the
 * shipped set is not device-specific: `default`, `compact` and `bottom-right`
 * differ by where they sit on the screen, not by what device they draw.
 * The table exists so that the day a device-specific arrangement ships, the
 * answer moves here and nowhere else.
 */
import { DEFAULT_LAYOUT } from './built-in-layouts';

type LayoutDeviceKind = 'gamepad' | 'keyboard';

const DEVICE_LAYOUTS: Readonly<Record<LayoutDeviceKind, string>> = {
  gamepad: DEFAULT_LAYOUT.id,
  keyboard: DEFAULT_LAYOUT.id,
};

const defaultLayoutIdFor = (device: LayoutDeviceKind): string => DEVICE_LAYOUTS[device];

export { DEVICE_LAYOUTS, defaultLayoutIdFor };
export type { LayoutDeviceKind };
