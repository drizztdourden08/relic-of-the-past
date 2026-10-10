/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';
import type { HeroFact } from '../ProfileHero.type';
import { CapitalizedFact } from '../sub-components/CapitalizedFact';

const factGroupOf = (facts: readonly HeroFact[]): FactsPanelGroup => facts.map(({ label, value, title, mono, capitalize }) => ({
  label,
  title,
  mono,
  value: capitalize ? createElement(CapitalizedFact, { value }) : value,
}));

export { factGroupOf };
