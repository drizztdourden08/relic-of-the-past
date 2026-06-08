/* @layer renderer-components @kind data */
import { CREDITS, getUsageLabel } from '@shared/credits';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import './CreditsTab.css';

const CreditsPage = () => {
  return (
    <Box className="credits-tab">
      <Box className="credits-tab__header">
        <Text as="h2" className="credits-tab__title">Credits & Attributions</Text>
        <Text as="p" className="credits-tab__subtitle">
          This project is built on the work of many talented people and communities.
        </Text>
      </Box>

      {CREDITS.map((category) => (
        <Box as="section" key={category.id} className="credits-tab__section">
          <Text as="h3" className="credits-tab__section-title">{category.title}</Text>
          <Box className="credits-tab__entries">
            {category.entries.map((entry) => (
              <Box key={`${category.id}-${entry.name}`} className="credits-tab__entry">
                <Box className="credits-tab__entry-header">
                  <Text className="credits-tab__entry-name">{entry.name}</Text>
                  <Text className="credits-tab__entry-project">
                    {entry.url ? (
                      <Box
                        as="a"
                        className="credits-tab__link"
                        href={entry.url}
                        onClick={(e) => { e.preventDefault(); window.open(entry.url); }}
                      >
                        {entry.project}
                      </Box>
                    ) : (
                      entry.project
                    )}
                  </Text>
                  {entry.license && (
                    <Text className="credits-tab__entry-license">{entry.license}</Text>
                  )}
                </Box>
                <Text as="p" className="credits-tab__entry-description">{entry.description}</Text>
                <Box className="credits-tab__entry-usage">
                  <Text className="credits-tab__usage-badge" data-level={entry.usage}>
                    {getUsageLabel(entry.usage)}
                  </Text>
                  <Text className="credits-tab__usage-note">{entry.usageNote}</Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export { CreditsPage };
