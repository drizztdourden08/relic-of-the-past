/* @layer renderer-components @kind component */
/**
 * The Run tab's picture of the options this run was generated with, read off the profile's
 * FROZEN snapshot, as two dashboard panels: the item pool the seed was filled from (the
 * options panel's own fill bar, the locations shuffled and the shuffle scopes), and how far
 * the settings depart from the game as shipped. The full list lives on the Options tab, one
 * click away.
 */
import { useMemo } from 'react';
import { normalizeRandomizerOptions } from '@shared/randomizer/options-snapshot';
import { usePoolImpacts } from '@app/hooks/randomizer/usePoolImpacts';
import { usePoolTotals } from '@app/hooks/randomizer/usePoolTotals';
import { optionsSummaryOf } from '../behavior/options-summary';
import { PoolSummary } from './PoolSummary';
import { SettingsSummary } from './SettingsSummary';
import type { PanelPlacement } from '../Randomizer.constants';

interface OptionsSummaryProps {
  pool: PanelPlacement;
  settings: PanelPlacement;
  /** The profile's stored option snapshot. */
  options: unknown;
  /** The seed this run was generated with; a random shop scope was drawn from it. */
  seed: string;
  onOpenOptions: () => void;
}

const OptionsSummary = (props: OptionsSummaryProps) => {
  const { pool, settings, options, seed, onOpenOptions } = props;
  const snapshot = useMemo(() => normalizeRandomizerOptions(options), [options]);
  const { accounting, error } = usePoolImpacts(snapshot, seed);
  const totals = usePoolTotals(accounting);
  const summary = useMemo(() => optionsSummaryOf(snapshot, seed), [snapshot, seed]);

  return (
    <>
      <PoolSummary placement={pool} accounting={accounting} totals={totals} error={error} summary={summary} />
      <SettingsSummary placement={settings} summary={summary} onOpenOptions={onOpenOptions} />
    </>
  );
};

export { OptionsSummary };
export type { OptionsSummaryProps };
