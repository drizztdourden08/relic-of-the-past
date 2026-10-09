/* @layer electron-main @kind logic */
import { ITEM_GROUP_IDS } from '@rotp/game-data';

const symbolicNeedle = (id: string): string | undefined => {
  const key = Object.entries(ITEM_GROUP_IDS).find(([, value]) => value === id)?.[0];
  return key ? `id: ITEM_GROUP_IDS.${key}` : undefined;
};

export { symbolicNeedle };
