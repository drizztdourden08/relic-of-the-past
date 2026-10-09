/* @layer renderer-components @kind logic */
import { Text } from '@drizztdourden08/tessera/primitives';
import type { FactsPanelGroup } from '@drizztdourden08/tessera/composites';
import type { HeroFact } from '../ProfileHero.type';

const factGroupOf = (facts: readonly HeroFact[]): FactsPanelGroup => facts.map(({ label, value, title, mono, capitalize }) => ({
  label,
  title,
  mono,
  value: capitalize ? <Text as="span" className="profile-hero__capitalize">{value}</Text> : value,
}));

export { factGroupOf };
