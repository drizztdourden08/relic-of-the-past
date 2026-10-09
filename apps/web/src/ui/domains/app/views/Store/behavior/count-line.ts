/* @layer renderer-components @kind logic */
const countLine = (shown: number): string => (shown === 1 ? '1 pack' : `${shown} packs`);

export { countLine };
