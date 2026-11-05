/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import type { RunPanelProps } from '@drizztdourden08/brock-randomizer';
import { normalizeRandomizerOptions } from '@rotp/randomizer';
import { usePoolImpacts } from '@app/hooks/randomizer/usePoolImpacts';
import { usePoolTotals } from '@app/hooks/randomizer/usePoolTotals';
import { optionsSummaryOf } from '@app/views/Randomizer/behavior/options-summary';

const useRotpRunSummary = ({ config }: Pick<RunPanelProps, 'config'>) => {
  const snapshot = useMemo(() => normalizeRandomizerOptions(config.options), [config.options]);
  const { accounting, error } = usePoolImpacts(snapshot, config.seed);
  const totals = usePoolTotals(accounting);
  const summary = useMemo(() => optionsSummaryOf(snapshot, config.seed), [snapshot, config.seed]);

  return { accounting, error, totals, summary };
};

export { useRotpRunSummary };
