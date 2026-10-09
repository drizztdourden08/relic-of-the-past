/* @layer bridge-wasm @kind logic */
import type { NetworkFacts, RoomSettings } from './network-facts.type';

const numberOr = (value: unknown, fallback: number | null): number | null =>
  (typeof value === 'number' ? value : fallback);

const observeSettings = (facts: NetworkFacts, packet: RoomSettings): void => {
  if (packet.permissions && typeof packet.permissions === 'object') facts.permissions = packet.permissions;
  facts.hintCostPercent = numberOr(packet.hint_cost, facts.hintCostPercent);
  facts.locationCheckPoints = numberOr(packet.location_check_points, facts.locationCheckPoints);
  facts.hintPoints = numberOr(packet.hint_points, facts.hintPoints);
};

export { observeSettings };
