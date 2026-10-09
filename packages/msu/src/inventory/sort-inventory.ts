/* @layer shared-storage @kind logic */
import { isInventoryName } from './is-inventory-name';

const sortInventory = (names: string[]): string[] =>
  names.filter(isInventoryName).sort((a, b) => a.localeCompare(b));

export { sortInventory };
