/* @layer renderer-components @kind component */
/** Glass strip along a hero's bottom edge: one row of facts, and an optional second row. */
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import type { HeroFact, HeroFactsProps } from './HeroFacts.type';
import './HeroFacts.css';

const valueClass = (fact: HeroFact): string => {
  let cls = 'hero__fact-value';
  if (fact.mono) cls += ' hero__fact-value--mono';
  if (fact.capitalize) cls += ' hero__fact-value--capitalize';
  return cls;
};

const renderFacts = (facts: HeroFact[]) => facts.map((fact) => (
  <Box key={fact.label} className="hero__fact">
    <Text className="hero__fact-label">{fact.label}</Text>
    <Text className={valueClass(fact)} title={fact.title}>{fact.value}</Text>
  </Box>
));

const HeroFacts = (props: HeroFactsProps) => {
  const { facts, extraFacts } = props;
  return (
    <Box className="hero__glass hero__facts">
      <Box className="hero__fact-row">{renderFacts(facts)}</Box>
      {extraFacts && (
        <Box className="hero__fact-row hero__fact-row--extra">
          {renderFacts(extraFacts)}
        </Box>
      )}
    </Box>
  );
};

export { HeroFacts };
