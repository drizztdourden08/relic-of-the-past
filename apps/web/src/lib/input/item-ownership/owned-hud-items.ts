/* @layer renderer-lib @kind logic */
import { buildItemCells } from '@shared/game/logic/pause';
import { useGameUIStore } from '@app/stores/game-ui-store';

const memo: { items: readonly number[]; bottles: readonly number[]; owned: readonly boolean[] } = {
  items: [],
  bottles: [],
  owned: [],
};

const sameNumbers = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((value, i) => value === b[i]);

const ownedHudItems = (): readonly boolean[] => {
  const { items, bottles } = useGameUIStore.getState().inventory;
  if (sameNumbers(items, memo.items) && sameNumbers(bottles, memo.bottles)) return memo.owned;
  memo.items = [...items];
  memo.bottles = [...bottles];
  memo.owned = buildItemCells(items, bottles).map(cell => cell.owned);
  return memo.owned;
};

export { ownedHudItems };
