/* @layer renderer-components @kind types */

/** One label/value cell of a hero's fact strip. */
interface HeroFact {
  label: string;
  value: string;
  /** Full value for the hover tooltip when the cell truncates. */
  title?: string;
  mono?: boolean;
  capitalize?: boolean;
}

interface HeroFactsProps {
  facts: HeroFact[];
  /** A second row under a divider, such as a run's seed and session; null hides it. */
  extraFacts?: HeroFact[] | null;
}

export type { HeroFact, HeroFactsProps };
