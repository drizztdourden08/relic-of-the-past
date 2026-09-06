/* @layer renderer-lib @kind logic */
/**
 * The In Pool cell's wording. A plain option reads as its diff on the fill
 * ("+33 loc · +33 items", "0 loc · 0 items" included — the zero muted, see
 * below); a locked row carries its reason, reworded for the player. A
 * capacity family reports its spot and its upgrade items separately —
 * upgrades take the place of filler one for one, so the pool does not grow
 * by that many and the cell must not say it does.
 */
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { PoolImpact } from '@shared/randomizer/ap-world/pool/pool-impact';

/** The pool accounting's short qualifiers, in the player's words. */
const NOTE_LABEL: Readonly<Record<string, string>> = {
  'n/a': 'not used',
  '0 shuffled': 'not shuffled',
};

const signed = (count: number): string => (count > 0 ? `+${count}` : String(count));

/**
 * A measured zero is still the answer — the row was diffed and adds nothing —
 * so it keeps its numbers and takes the muted treatment every other
 * contributes-nothing row already wears (a locked row's reason, a capacity
 * family planning no upgrade). Muting rather than blanking is what makes the
 * difference visible: an unmuted line is a live contribution, a muted one is
 * a row that changes the seed without changing the pool.
 */
const poolImpactCell = (impact: PoolImpact): ImpactCell => (impact.note !== ''
  ? { text: NOTE_LABEL[impact.note] ?? impact.note, muted: true }
  : {
    text: `${signed(impact.locations)} loc · ${signed(impact.items)} items`,
    muted: impact.locations === 0 && impact.items === 0,
  });

const familyImpactCell = (spotIsCheck: boolean, upgrades: number): ImpactCell => ({
  text: `${signed(spotIsCheck ? 1 : 0)} loc · ${upgrades} upgrade${upgrades === 1 ? '' : 's'}`,
  muted: upgrades === 0 && !spotIsCheck,
});

export { familyImpactCell, poolImpactCell };
