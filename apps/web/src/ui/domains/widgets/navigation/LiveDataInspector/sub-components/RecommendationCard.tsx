/* @layer renderer-widgets @kind component */
/**
 * One open finding on this screen: what kind it is, how sure the detector
 * was, and the one-line reason. Clicking it opens the Data Inspector's own
 * comparison view at this exact finding — the card never shows a diff
 * itself, so there is only ever one place a finding's current/proposed pair
 * is rendered.
 */
import { Badge, Button, Text } from '@ds/primitives';
import { useDataViewStore } from '@app/stores/data-view-store';
import type { Recommendation } from '@shared/game/recommendations';
import './RecommendationCard.css';

const ACTION_LABEL: Record<Recommendation['action'], string> = {
  create: 'Add', update: 'Change', delete: 'Remove',
};

interface RecommendationCardProps {
  entry: Recommendation;
}

const RecommendationCard = (props: RecommendationCardProps) => {
  const { entry } = props;
  const openRecommendation = useDataViewStore(s => s.openRecommendation);

  return (
    <Button
      variant="bare"
      className="live-rec-card"
      onClick={() => openRecommendation(entry)}
    >
      <Badge variant={entry.confidence === 'certain' ? 'success' : 'warning'}>{entry.confidence}</Badge>
      <Text className="live-rec-card__claim">{`${ACTION_LABEL[entry.action]} ${entry.kind}`}</Text>
      <Text className="live-rec-card__reason">{entry.reason}</Text>
    </Button>
  );
};

export { RecommendationCard };
export type { RecommendationCardProps };
