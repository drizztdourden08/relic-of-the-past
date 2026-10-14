/* @layer renderer-components @kind hook */
import { instructionFor } from './instruction-for';
import type { UsePositionalOneByOneProps } from './positional-capture.type';
import { usePositionalActions } from './usePositionalActions';
import { usePositionalInput } from './usePositionalInput';
import { usePositionalSession } from './usePositionalSession';

const usePositionalOneByOne = (props: UsePositionalOneByOneProps) => {
  const { deviceKey, active, resolvedDevice } = props;
  const session = usePositionalSession({ active, resolvedDevice });
  usePositionalInput(session, deviceKey, active);
  const actions = usePositionalActions(session);
  const { refs, items, records, activeIndex, inputPhaseActive, autoAdvance, setAutoAdvanceWrapped, setInputPhaseActiveWrapped } = session;

  const capturedCount = items.filter((it) => it.status === 'captured' || it.status === 'skipped').length;
  const activeTarget = refs.targetsRef.current[activeIndex];
  const instruction = inputPhaseActive && activeTarget ? instructionFor(activeTarget) : '';

  return {
    items, records, activeIndex, inputPhaseActive, autoAdvance, capturedCount, instruction,
    ...actions,
    setAutoAdvanceWrapped, setInputPhaseActiveWrapped,
  };
};

export { usePositionalOneByOne };
