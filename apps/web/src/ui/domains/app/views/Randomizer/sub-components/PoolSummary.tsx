/* @layer renderer-components @kind component */
/**
 * The options summary's item pool panel: the options panel's own fill bar (items, capacity
 * upgrades, filler and the rest against every location), the locations the fill shuffled
 * against those kept vanilla, then each shuffle scope as an on or off pill.
 */
import { Chip, FlagPill, Grid, SectionHeader } from '@ds/primitives';
import { DashboardPanel, StatTileGrid } from '@ds/composites';
import { PoolFillBar } from '@domains/app/compounds/PoolFillBar';
import { locationTilesOf, outOf } from '../behavior/options-summary-tiles';
import type { PoolFillTotals } from '@domains/app/compounds/PoolFillBar';
import type { PoolAccounting } from '@shared/randomizer/world/pool/pool-accounting';
import type { OptionsSummary } from '../behavior/options-summary.type';
import type { PanelPlacement } from '../Randomizer.constants';

interface PoolSummaryProps {
  placement: PanelPlacement;
  /** Null when the pool could not be built; `error` then says why. */
  accounting: PoolAccounting | null;
  totals: PoolFillTotals | null;
  error?: string;
  summary: OptionsSummary;
}

const PoolSummary = (props: PoolSummaryProps) => {
  const { placement, accounting, totals, error, summary } = props;

  return (
    <DashboardPanel {...placement} title="Item pool">
      <PoolFillBar totals={totals} error={error} legend="stacked" />
      {accounting !== null && <StatTileGrid tiles={locationTilesOf(accounting)} />}
      <SectionHeader title="Shuffle scopes" action={<Chip>{outOf(summary.scopes)}</Chip>} />
      <Grid track="flag" gap="xs">
        {summary.scopeFlags.map((flag) => <FlagPill key={flag.id} label={flag.label} on={flag.on} />)}
      </Grid>
    </DashboardPanel>
  );
};

export { PoolSummary };
export type { PoolSummaryProps };
