/* @layer renderer-components @kind types */

interface HeroFact {
  label: string;
  value: string;
  title?: string;
  mono?: boolean;
  capitalize?: boolean;
}

interface HeroFactsProps {
  facts: HeroFact[];
  extraFacts?: HeroFact[] | null;
}

export type { HeroFact, HeroFactsProps };
