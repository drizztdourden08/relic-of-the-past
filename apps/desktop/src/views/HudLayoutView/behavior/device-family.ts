/* @layer renderer-hud @kind logic */
import type { ModernSlot, DeviceFamily } from '@rotp/game-data';
import { FAMILY_PREFIXES } from '../HudLayoutView.constants';

const familyOfIcon = (key: string | undefined): DeviceFamily | null => {
  if (!key) return null;
  const hit = FAMILY_PREFIXES.find(([prefix]) => key.startsWith(prefix));
  return hit ? hit[1] : null;
};

const familyOfSlot = (slot: ModernSlot): DeviceFamily | null => {
  const fromIcon = familyOfIcon(slot.icon?.key);
  if (fromIcon) return fromIcon;
  if (slot.position) return null;
  return slot.binding.type === 'keyboard' ? 'keyboard' : null;
};

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
