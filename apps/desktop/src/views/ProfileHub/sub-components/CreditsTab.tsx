/* @layer renderer-components @kind component */
import { CREDITS } from '@app/credits';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { CreditEntryCard } from './CreditEntryCard';
import './CreditsTab.css';

const CreditsPage = () => {
  return (
    <Box className="credits-tab">
      <Box className="credits-tab__header">
        <Text as="p" className="credits-tab__subtitle">
          This project is built on the work of many talented people and communities.
        </Text>
      </Box>

      {CREDITS.map((category) => (
        <Box as="section" key={category.id} className="credits-tab__section">
          <Text as="h3" className="credits-tab__section-title">{category.title}</Text>
          <Box className="credits-tab__entries">
            {category.entries.map((entry) => (
              <CreditEntryCard key={`${category.id}-${entry.name}`} entry={entry} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export { CreditsPage };
