/* @layer renderer-widgets @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Pressable, Status, Text } from '@drizztdourden08/tessera/primitives';
import { KIND_SINGULARS } from '@app/views/DataInspector/DataInspector.constants';
import { useDataViewStore } from '@app/stores/data-view-store';
import { ACTION_LABEL } from '../LiveDataInspector.constants';
import type { RecommendationCardProps } from '../LiveDataInspector.type';
import './RecommendationCard.css';

const RecommendationCard = (props: RecommendationCardProps) => {
  const { entry } = props;
  const t = useT();
  const text = useText();
  const certain = entry.confidence === 'certain';
  const openRecommendation = useDataViewStore(s => s.openRecommendation);

  return (
    <Pressable
      className="live-rec-card"
      onClick={() => openRecommendation(entry)}
    >
      <Status tone={certain ? 'success' : 'warning'}>{certain ? t('views-live-data-inspector:confidence.certain') : t('views-live-data-inspector:confidence.likely')}</Status>
      <Text className="live-rec-card__claim">{t('views-live-data-inspector:card.claim', { action: text(ACTION_LABEL[entry.action]), kind: text(KIND_SINGULARS[entry.kind] ?? entry.kind) })}</Text>
      <Text className="live-rec-card__reason">{entry.reason}</Text>
    </Pressable>
  );
};

export { RecommendationCard };
