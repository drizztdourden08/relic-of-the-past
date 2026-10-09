/* @layer shared-game @kind logic */
const demandItemNameOf = (itemName: string): string => itemName.replace(/^Progressive /, '');

export { demandItemNameOf };
