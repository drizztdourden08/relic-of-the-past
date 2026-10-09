/* @layer test @kind helper */
import type { DetectionContext, ScreenObservations } from '@shared/game/recommendations';

const contextFor = (o: ScreenObservations): DetectionContext =>
  ({ origin: 'live', screenId: o.match?.screen.id ?? null, observations: o });

export { contextFor };
