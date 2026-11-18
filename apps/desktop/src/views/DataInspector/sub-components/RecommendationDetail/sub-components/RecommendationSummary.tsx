/* @layer renderer-app @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Status, Box, Text } from '@drizztdourden08/tessera/primitives';
import { KIND_SINGULARS } from '@app/views/DataInspector/DataInspector.constants';
import { ACTION_LABEL } from '../RecommendationDetail.constants';
import type { RecommendationSummaryProps } from '../RecommendationDetail.type';

const RecommendationSummary = (props: RecommendationSummaryProps) => {
  const { entry } = props;
  const t = useT();
  const text = useText();
  const certain = entry.confidence === 'certain';

  return (
    <Box className="rec-summary">
      <Box className="rec-summary__head">
        <Status tone={certain ? 'success' : 'warning'}>
          {certain ? t('views-data-inspector:rec.confidence.certain') : t('views-data-inspector:rec.confidence.likely')}
        </Status>
        <Text className="rec-summary__claim">
          {t('views-data-inspector:rec.claim', {
            action: text(ACTION_LABEL[entry.action]),
            kind: text(KIND_SINGULARS[entry.kind]),
            target: entry.targetId ?? t('views-data-inspector:rec.new-record'),
          })}
        </Text>
        <Text className="rec-summary__origin">
          {t('views-data-inspector:rec.origin', {
          detector: entry.detector,
          origin: entry.origin,
          screen: entry.screenId ?? t('views-data-inspector:rec.no-screen'),
        })}
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
