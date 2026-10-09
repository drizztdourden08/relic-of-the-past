/* @layer bridge-wasm @kind constants */
const WARP_DOOR = 0x46;
const WARP_SLOT: Partial<Record<string, number>> = { west: 3, east: 4 };
const WARP_SLOTS: readonly number[] = [3, 4];
const FOLLOWER_DOOR = 0x14;
const FOLLOWER_REQ = 'follower';

export { WARP_DOOR, WARP_SLOT, WARP_SLOTS, FOLLOWER_DOOR, FOLLOWER_REQ };
