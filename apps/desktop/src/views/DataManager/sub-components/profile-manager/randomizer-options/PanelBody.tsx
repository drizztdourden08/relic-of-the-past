/* @layer renderer-components @kind component */
import { PoolListing } from '@app/compounds/PoolListing';
import { OptionTabBody } from './OptionTabBody';
import { POOL_TAB } from '../RandomizerOptionsPanel.constants';
import type { PanelBodyProps } from '../RandomizerOptionsPanel.type';

const PanelBody = (props: PanelBodyProps) => {
  const { tab, model, choices, seed, onChange } = props;
  const { snapshot, groups, fixed, valueOf, cellOf, pondDemands, notes, accounting, listing, totals, error, handleRowChange } = model;

  if (tab === POOL_TAB) return <PoolListing groups={listing} totals={totals} error={error} />;

  return (
    <OptionTabBody
      tab={tab}
      groups={groups}
      lockedGroups={fixed}
      values={snapshot.values}
      valueOf={valueOf}
      cellOf={cellOf}
      choices={choices}
      seed={seed}
      pondDemands={pondDemands}
      notes={notes}
      fillerHeadroom={accounting?.filler ?? null}
      onRowChange={onChange === undefined ? undefined : handleRowChange}
      onChange={onChange}
    />
  );
};

export { PanelBody };
