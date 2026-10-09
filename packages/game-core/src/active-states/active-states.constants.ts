/* @layer bridge-wasm @kind constants */
const TAGALONG_NAMES: Readonly<Record<number, string>> = {
  1: 'Princess',
  4: 'Old Man',
  5: 'Uncle',
  6: 'Crystal Maiden',
  7: "Blacksmith's frog",
  9: 'Locksmith',
  10: 'Kiki',
  12: 'Purple Chest',
  13: 'Super Bomb',
};

const SLOT = {
  progressIndicator: 0,
  progressFlags: 1,
  follower: 13,
  smallKeys: 14,
  bigKey: 15,
} as const;

const NO_KEY_COUNT = 0xff;

const FIRST_REPORTED_TIER = 1;

export { TAGALONG_NAMES, SLOT, NO_KEY_COUNT, FIRST_REPORTED_TIER };
