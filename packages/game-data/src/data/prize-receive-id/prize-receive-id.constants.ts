/* @layer shared-game @kind constants */
const PRIZE_VIRT_FIRST = 0x7b;
const PRIZE_VIRT_LAST = 0x81;

const CRYSTAL_NATIVE_RECEIVE_ID = 0x20;

const PRIZE_RECEIVE_ID_BY_NAME: ReadonlyMap<string, number> = new Map([
  ['Crystal 1', 0x7b],
  ['Crystal 2', 0x7c],
  ['Crystal 3', 0x7d],
  ['Crystal 4', 0x7e],
  ['Crystal 5', 0x7f],
  ['Crystal 6', 0x80],
  ['Crystal 7', 0x81],
]);

const VANILLA_PRIZE_GRANT_ID_BY_NAME: ReadonlyMap<string, number> = new Map([
  ['Crystal 1', CRYSTAL_NATIVE_RECEIVE_ID],
  ['Crystal 2', CRYSTAL_NATIVE_RECEIVE_ID],
  ['Crystal 3', CRYSTAL_NATIVE_RECEIVE_ID],
  ['Crystal 4', CRYSTAL_NATIVE_RECEIVE_ID],
  ['Crystal 5', CRYSTAL_NATIVE_RECEIVE_ID],
  ['Crystal 6', CRYSTAL_NATIVE_RECEIVE_ID],
  ['Crystal 7', CRYSTAL_NATIVE_RECEIVE_ID],
]);

export { CRYSTAL_NATIVE_RECEIVE_ID, PRIZE_RECEIVE_ID_BY_NAME, PRIZE_VIRT_FIRST, PRIZE_VIRT_LAST, VANILLA_PRIZE_GRANT_ID_BY_NAME };
