/* @layer renderer-components @kind component */
/** Glass strip along the hero's bottom edge: profile facts, then the run row. */
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import type { HeroFact } from '../ProfileHero.type';
import './HeroFacts.css';

interface HeroFactsProps {
  facts: HeroFact[];
  runFacts: HeroFact[] | null;
}

const valueClass = (fact: HeroFact): string => {
  let cls = 'profile-hero__fact-value';
  if (fact.mono) cls += ' profile-hero__fact-value--mono';
  if (fact.capitalize) cls += ' profile-hero__fact-value--capitalize';
  return cls;
};

const renderFacts = (facts: HeroFact[]) => facts.map((fact) => (
  <Box key={fact.label} className="profile-hero__fact">
    <Text className="profile-hero__fact-label">{fact.label}</Text>
    <Text className={valueClass(fact)} title={fact.title}>{fact.value}</Text>
  </Box>
));

const HeroFacts = (props: HeroFactsProps) => {
  const { facts, runFacts } = props;
  return (
    <Box className="profile-hero__glass profile-hero__facts">
      <Box className="profile-hero__fact-row">{renderFacts(facts)}</Box>
      {runFacts && (
        <Box className="profile-hero__fact-row profile-hero__fact-row--run">
          {renderFacts(runFacts)}
        </Box>
      )}
    </Box>
  );
};

export { HeroFacts };
