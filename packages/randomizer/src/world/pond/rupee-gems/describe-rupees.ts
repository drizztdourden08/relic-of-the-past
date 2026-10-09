/* @layer shared-game @kind logic */
import { decomposeRupees } from './decompose-rupees';

const describeRupees = (amount: number): string => {
  const counts = new Map<string, number>();
  for (const gem of decomposeRupees(amount)) counts.set(gem.colour, (counts.get(gem.colour) ?? 0) + 1);
  return [...counts].map(([colour, count]) => `${count} ${colour}`).join(', ');
};

export { describeRupees };
