/* @layer renderer-app @kind component */
/**
 * What the finding IS, above the two panes: the claim, how sure the detector
 * was, and the facts it looked at. The evidence is shown rather than summarised
 * because it is the only thing on the screen that lets a reviewer disagree with
 * the proposal for a reason other than taste.
 */
import { Badge, Box, Text } from '@ds/primitives';
import type { Recommendation } from '@shared/game/recommendations';

const ACTION_LABEL: Record<Recommendation['action'], string> = {
  create: 'Add',
  update: 'Change',
  delete: 'Remove',
};

const NOWHERE = 'no screen';

interface RecommendationSummaryProps {
  entry: Recommendation;
}

const RecommendationSummary = (props: RecommendationSummaryProps) => {
  const { entry } = props;

  return (
    <Box className="rec-summary">
      <Box className="rec-summary__head">
        <Badge variant={entry.confidence === 'certain' ? 'success' : 'warning'}>
          {entry.confidence}
        </Badge>
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
export type { RecommendationSummaryProps };
