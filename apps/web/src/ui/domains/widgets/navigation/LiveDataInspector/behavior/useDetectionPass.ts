/* @layer renderer-widgets @kind hook */
import { useEffect, useRef } from 'react';
import { applyRecommendationPass } from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/recommendation-cache';
import { ENTITY_KINDS } from '@app/ui/domains/app/views/DataInspector/DataInspector.constants';
import { runDetectionSweep } from '@shared/game/recommendations';
import type { DetectionContext } from '@shared/game/recommendations';
import { useContextSignature } from './useContextSignature';
import { PASS_DEBOUNCE_MS } from '../LiveDataInspector.constants';
import '../../recommendations/strategies/connection';
import '@shared/game/recommendations/strategies/screen';
import '@shared/game/recommendations/strategies/actor';
import '@shared/game/recommendations/strategies/check';
import '@shared/game/recommendations/strategies/dungeon';
import '@shared/game/recommendations/strategies/item';
import '@shared/game/recommendations/strategy-detectors';
import '../../recommendations/strategies/connection/wire-detector';

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
