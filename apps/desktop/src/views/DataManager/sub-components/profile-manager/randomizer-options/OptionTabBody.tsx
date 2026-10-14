/* @layer renderer-components @kind component */
import { CapacityTabBody } from './CapacityTabBody';
import { OptionGroupList } from './OptionGroupList';
import { SubjectFixedRows } from './SubjectFixedRows';
import { TabLeadBlocks } from './TabLeadBlocks';
import { TabTrailBlocks } from './TabTrailBlocks';
import { UpcomingTabBody } from './UpcomingTabBody';
import { UPCOMING_TITLE } from './option-tab-copy.constants';
import { isUpcomingTab } from './is-upcoming-tab';
import { listViewOf } from './list-view-of';
import { optionTabContextOf } from './option-tab-context-of';
import type { OptionDef } from '@rotp/randomizer';
import type { OptionTabBodyProps } from './OptionTabBody.type';

const OptionTabBody = (props: OptionTabBodyProps) => {
  const {
    tab, groups, lockedGroups, values, valueOf, cellOf, notes, fillerHeadroom, onRowChange, onChange,
  } = props;

  const context = optionTabContextOf(props);
  const { choices, rule, capacity, walletFloor, readout } = context;
  const fixedValueOf = (option: OptionDef) => values[option.key] ?? option.baseline;

  if (tab === 'capacity') {
    return (
      <CapacityTabBody
        choices={choices}
        rule={rule}
        capacity={capacity}
        walletFloor={walletFloor}
        notes={notes}
        fillerHeadroom={fillerHeadroom}
        onChange={onChange}
      />
    );
  }

  if (isUpcomingTab(tab)) {
    return (
      <UpcomingTabBody
        title={UPCOMING_TITLE}
        groups={lockedGroups[tab]}
        valueOf={fixedValueOf}
        cellOf={cellOf}
        readout={readout}
      />
    );
  }

  const list = listViewOf(tab, context, groups, valueOf);

  return (
    <>
      <TabLeadBlocks tab={tab} context={context} />
      <OptionGroupList
        groups={list.groups}
        valueOf={list.valueOf}
        cellOf={cellOf}
        frozenKeys={list.frozenKeys}
        notes={list.notes}
        onRowChange={onRowChange}
        readout={readout}
        live
      />
      <TabTrailBlocks tab={tab} context={context} />
      <SubjectFixedRows
        tab={tab}
        lockedGroups={lockedGroups}
        valueOf={fixedValueOf}
        cellOf={cellOf}
        readout={readout}
      />
    </>
  );
};

export { OptionTabBody };
