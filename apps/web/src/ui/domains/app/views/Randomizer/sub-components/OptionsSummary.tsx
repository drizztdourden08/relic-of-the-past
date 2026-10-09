/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import { usePoolImpacts } from '@app/hooks/randomizer/usePoolImpacts';
import { usePoolTotals } from '@app/hooks/randomizer/usePoolTotals';
import { optionsSummaryOf } from '../behavior/options-summary';
import { PoolSummary } from './PoolSummary';
import { SettingsSummary } from './SettingsSummary';
import type { OptionsSummaryProps } from './OptionsSummary.type';

const OptionsSummary = (props: OptionsSummaryProps) => {
  const { pool, settings, options, seed, onOpenOptions } = props;
  const frozenSnapshot = useMemo(() => normalizeRandomizerOptions(options), [options]);
  const { accounting, error } = usePoolImpacts(frozenSnapshot, seed);
  const totals = usePoolTotals(accounting);
  const summary = useMemo(() => optionsSummaryOf(frozenSnapshot, seed), [frozenSnapshot, seed]);

  return (
    <>
      <PoolSummary placement={pool} accounting={accounting} totals={totals} error={error} summary={summary} />
      <SettingsSummary placement={settings} summary={summary} onOpenOptions={onOpenOptions} />
    </>
  );
};

export { OptionsSummary };
export type { OptionsSummaryProps };
