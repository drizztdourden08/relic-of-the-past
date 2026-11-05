/* @layer renderer-components @kind component */
import { OptionTabBody } from '@app/views/DataManager/sub-components/profile-manager/randomizer-options/OptionTabBody';
import { useRotpOptionModel } from './useRotpOptionModel';
import type { RotpOptionTabBodyProps } from './RotpOptionTabBody.type';

const RotpOptionTabBody = ({ tab, ...tabProps }: RotpOptionTabBodyProps) => {
  const model = useRotpOptionModel(tabProps);
  const { snapshot, choices, groups, fixed, valueOf, cellOf, pondDemands, notes, accounting, handleChange, handleRowChange } = model;

  return (
    <OptionTabBody
      tab={tab}
      groups={groups}
      lockedGroups={fixed}
      values={snapshot.values}
      valueOf={valueOf}
      cellOf={cellOf}
      choices={choices}
      seed={tabProps.seed}
      pondDemands={pondDemands}
      notes={notes}
      fillerHeadroom={accounting?.filler ?? null}
      onRowChange={handleRowChange}
      onChange={handleChange}
    />
  );
};

export { RotpOptionTabBody };
