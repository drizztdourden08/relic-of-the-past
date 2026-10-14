/* @layer renderer-widgets @kind hook */
import { useEffect, useRef } from 'react';
import { applyRecommendationPass } from '@app/data-inspector/recommendations/recommendation-cache';
import { ENTITY_KINDS } from '@app/views/DataInspector/DataInspector.constants';
import { runDetectionSweep } from '@rotp/navigation';
import type { DetectionContext } from '@rotp/navigation';
import { useContextSignature } from './useContextSignature';
import { PASS_DEBOUNCE_MS } from '../LiveDataInspector.constants';
import '../../../nav-widget/recommendations/strategies/connection';
import '@rotp/navigation';
import '@rotp/navigation';
import '@rotp/navigation';
import '@rotp/navigation';
import '@rotp/navigation';
import '@rotp/navigation';
import '../../../nav-widget/recommendations/strategies/connection/wire-detector';

const runPass = (context: DetectionContext): void => {
  const { detectorIds, draftsByKind } = runDetectionSweep(ENTITY_KINDS, context);
  for (const [kind, drafts] of draftsByKind) {
    void applyRecommendationPass(kind, context, detectorIds, drafts);
  }
};

const useDetectionPass = (context: DetectionContext): void => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signature = useContextSignature(context);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => runPass(context), PASS_DEBOUNCE_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [signature]);
};

export { useDetectionPass };
