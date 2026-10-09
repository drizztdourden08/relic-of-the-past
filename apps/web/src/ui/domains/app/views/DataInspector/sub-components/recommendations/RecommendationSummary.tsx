/* @layer renderer-app @kind component */
import { Status, Box, Text } from '@drizztdourden08/tessera/primitives';
import { ACTION_LABEL, NOWHERE } from './RecommendationDetail.constants';
import type { RecommendationSummaryProps } from './RecommendationDetail.type';

const RecommendationSummary = (props: RecommendationSummaryProps) => {
  const { entry } = props;

  return (
    <Box className="rec-summary">
      <Box className="rec-summary__head">
        <Status tone={entry.confidence === 'certain' ? 'success' : 'warning'}>
          {entry.confidence}
        </Status>
        <Text className="rec-summary__claim">
          {`${ACTION_LABEL[entry.action]} ${entry.kind} · ${entry.targetId ?? 'new record'}`}
        </Text>
        <Text className="rec-summary__origin">
          {`${entry.detector} · ${entry.origin} · ${entry.screenId ?? NOWHERE}`}
        </Text>
      </Box>
      <Text as="p" className="rec-summary__reason">{entry.reason}</Text>
      {entry.evidence.length > 0 && (
        <Box as="ul" className="rec-summary__evidence">
          {entry.evidence.map((item, index) => (
            <Box as="li" key={`${item.source}-${index}`}>
              <Text className="rec-summary__source">{item.source}</Text>
              <Text className="rec-summary__detail">{item.detail}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export { RecommendationSummary };
