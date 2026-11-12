/* @layer website-site @kind logic */
import type { CloudItem } from '../CloudStage.type';

const dealWords = (items: readonly CloudItem[], parts: number): CloudItem[][] => {
  const longFirst = [...items].sort((a, b) => b.ratio.width - a.ratio.width);
  const dealt: CloudItem[][] = Array.from({ length: parts }, () => []);
  const totals: number[] = Array.from({ length: parts }, () => 0);

  longFirst.forEach((item) => {
    const lightest = totals.indexOf(Math.min(...totals));
    dealt[lightest]?.push(item);
    totals[lightest] = (totals[lightest] ?? 0) + item.ratio.width;
  });
  return dealt.map((part) => part.sort((a, b) => a.ratio.width - b.ratio.width));
};

export { dealWords };
