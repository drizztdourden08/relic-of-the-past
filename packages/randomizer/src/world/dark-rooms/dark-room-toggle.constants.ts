/* @layer shared-game @kind constants */
const DARK_ROOM_TOGGLE = {
  group: 'world' as const,
  kind: 'toggle' as const,
  implementation: 'active' as const,
  locked: false,
  synthetic: true,
};

export { DARK_ROOM_TOGGLE };
