/* @layer renderer-components @kind logic */
/** A family's item count in words, as its slider and its read-out both show it. */
const itemsLabel = (count: number): string => `${count} item${count === 1 ? '' : 's'}`;

export { itemsLabel };
