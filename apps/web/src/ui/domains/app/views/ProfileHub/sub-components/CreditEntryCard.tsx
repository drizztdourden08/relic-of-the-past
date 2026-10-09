/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { getUsageLabel } from '@shared/credits';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import type { CreditEntryCardProps } from './CreditsTab.type';

const CreditEntryCard = ({ entry }: CreditEntryCardProps) => {
  const { url } = entry;
  const handleLinkClick = useCallback((e: MouseEvent) => { e.preventDefault(); window.open(url); }, [url]);

  return (
    <Box className="credits-tab__entry">
      <Box className="credits-tab__entry-header">
        <Text className="credits-tab__entry-name">{entry.name}</Text>
        <Text className="credits-tab__entry-project">
          {url ? (
            <Box
              as="a"
              className="credits-tab__link"
              href={url}
              onClick={handleLinkClick}
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
  );
};

export { CreditEntryCard };
