/* @layer renderer-components @kind logic */
import type { PondAskAmountKind, PondAskSetting } from '@rotp/randomizer';

const askWithRange = (
  ask: PondAskSetting, kind: PondAskAmountKind, stops: readonly string[], range: readonly [number, number],
): PondAskSetting =>
  ({ ...ask, [kind]: { ...ask[kind], min: Number(stops[range[0]]), max: Number(stops[range[1]]) } });

export { askWithRange };
