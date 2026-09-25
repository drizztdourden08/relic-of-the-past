/* @layer renderer-hud @kind logic */
/**
 * Which device family a bound slot list came from.
 *
 * The glyph chain needs a family so the 'auto' pack can follow the pad in hand,
 * but the control-scheme store carries bindings, not hardware: asking the SDL
 * device list for it would drag an IPC round trip into a per-frame render path.
 * The slots already carry the icon the device layer resolved for them, and that
 * icon key is family-stamped by construction ('xbox-a', 'ps-cross'), so the
 * answer is already in hand and this just reads it back.
 *
 * Order matters, and it used to be the wrong way round. A slot's ICON is the
 * only thing here that describes the DEVICE; its binding describes what that
 * one control was rebound to read. Asking the binding first meant a single slot
 * moved to a keyboard key answered 'keyboard' for the whole cluster, and every
 * chip on the pad redrew as a key cap. So: the icon first, the binding only for
 * a slot that names no position at all (a keyboard profile's slots, which SDL
 * never enumerates), and the profile's own declared family as the backstop when
 * no slot admits to anything. A generic pad's icon keys are family-less by
 * design, and 'generic' is a worse answer than the one the profile already has.
 *
 * The family is a property of the DEVICE, so it is decided by the whole list
 * instead of by whichever slot happens to sort first: the family the most
 * slots vote for wins, and one rebound control cannot outvote the pad it sits on.
 */
import type { ModernSlot } from '@shared/types/controls/scheme';
import type { DeviceFamily } from '@shared/types/controls';

/** Icon-key prefix to family. Ordered longest-first so 'ps-' cannot shadow a
 *  longer key that happens to start the same way. */
const FAMILY_PREFIXES: readonly (readonly [string, DeviceFamily])[] = [
  ['switch-', 'nintendo'],
  ['xbox-', 'xbox'],
  ['ps-', 'playstation'],
  ['gc-', 'nintendo'],
];

const familyOfIcon = (key: string | undefined): DeviceFamily | null => {
  if (!key) return null;
  const hit = FAMILY_PREFIXES.find(([prefix]) => key.startsWith(prefix));
  return hit ? hit[1] : null;
};

/** What one slot says about the device it belongs to, or null for "nothing". */
const familyOfSlot = (slot: ModernSlot): DeviceFamily | null => {
  const fromIcon = familyOfIcon(slot.icon?.key);
  if (fromIcon) return fromIcon;
  // A slot that names an SDL position is a control ON the device however it has
  // since been rebound, so its binding is not evidence about the hardware.
  if (slot.position) return null;
  return slot.binding.type === 'keyboard' ? 'keyboard' : null;
};

/** The family the most slots vote for; the profile's declared one when none
 *  of them vote at all; 'generic' when there is no declared one either, which
 *  is exactly what the generic pack is for. */
const deviceFamilyOf = (slots: readonly ModernSlot[], declared?: DeviceFamily | null): DeviceFamily => {
  const votes = new Map<DeviceFamily, number>();
  for (const slot of slots) {
    const family = familyOfSlot(slot);
    if (family) votes.set(family, (votes.get(family) ?? 0) + 1);
  }
  let winner: DeviceFamily | null = null;
  let best = 0;
  for (const [family, count] of votes) {
    if (count > best) { winner = family; best = count; }
  }
  return winner ?? declared ?? 'generic';
};

export { deviceFamilyOf };
