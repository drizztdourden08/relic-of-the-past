/* @layer renderer-app @kind hook */
import { useMemo } from 'react';
import { buildSchema } from '@drizztdourden08/tessera/data';
import { useRecommendations, useRecommendationsReady } from '@app/data-inspector/recommendations/use-recommendations';
import { recommendationSource } from '@app/data-inspector/recommendations/recommendation-source';
import { NO_SCHEMA } from '../DataInspector.constants';
import type { InspectorKind } from '../DataInspector.type';
import { isEntityKind } from './is-entity-kind';
import { pendingSource } from './pending-source';
import { useKindData } from './useKindData';

const useInspectorSource = (kind: InspectorKind) => {
  const entityKind = isEntityKind(kind) ? kind : null;
  const reviewing = entityKind === null;
  const kindData = useKindData(entityKind);
  const entries = useRecommendations(reviewing);
  const reviewReady = useRecommendationsReady(reviewing);

  const reviewSource = useMemo(() => recommendationSource(entries), [entries]);
  const reviewSchema = useMemo(
    () => (reviewing ? buildSchema(reviewSource.rows, reviewSource.config) : NO_SCHEMA),
    [reviewing, reviewSource],
  );
  const source = entityKind ? (kindData?.source ?? pendingSource(entityKind)) : reviewSource;
  const schema = entityKind ? (kindData?.schema ?? NO_SCHEMA) : reviewSchema;
  const loading = entityKind ? !kindData : !reviewReady;

  return { source, schema, loading, entries };
};

export { useInspectorSource };
