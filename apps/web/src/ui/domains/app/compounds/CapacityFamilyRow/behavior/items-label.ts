/* @layer renderer-components @kind logic */
const itemsLabel = (count: number): string => `${count} item${count === 1 ? '' : 's'}`;

export { itemsLabel };
