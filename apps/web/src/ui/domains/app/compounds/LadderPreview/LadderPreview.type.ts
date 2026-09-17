/* @layer renderer-components @kind types */
interface LadderPreviewProps {
  /**
   * One chip per ladder value, the start first, already formatted. A chip left
   * blank draws its icon alone, which is what a demand carrying no amount (one
   * item, held up and handed back) reads as.
   */
  chips: readonly string[];
  /** The jump label drawn before each chip after the first (chips.length − 1 entries). */
  jumps: readonly string[];
  /** The sprite drawn inside each chip, ahead of its value; one entry per chip. */
  icons?: readonly (string | undefined)[];
  /** Vanilla: the native ladder, nothing in the pool. */
  dim?: boolean;
  /** A short qualifier after the chips ("sold at the pond", "7 upgrade items to find"). */
  note?: string;
  /** The last jump ran past the top of the ladder, a surplus step. */
  surplus?: boolean;
  /** The jumps are taken in this order whatever the shuffle did: number them (1st, 2nd ...). */
  ordered?: boolean;
  className?: string;
}

export type { LadderPreviewProps };
