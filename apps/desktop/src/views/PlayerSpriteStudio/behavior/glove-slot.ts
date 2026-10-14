/* @layer renderer-components @kind logic */
const gloveSlot = (slot: 'g0' | 'g1'): 0 | 1 => (slot === 'g0' ? 0 : 1);

export { gloveSlot };
