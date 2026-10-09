/* @layer renderer-widgets @kind component */
import { Badge, Button, Text } from '@ds/primitives';
import { useDataViewStore } from '@app/stores/data-view-store';
import { ACTION_LABEL } from '../LiveDataInspector.constants';
import type { RecommendationCardProps } from '../LiveDataInspector.type';
import './RecommendationCard.css';

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
