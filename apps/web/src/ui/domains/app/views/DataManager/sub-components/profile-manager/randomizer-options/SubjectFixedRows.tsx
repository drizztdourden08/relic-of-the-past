/* @layer renderer-components @kind component */
import { LockedRowsSection } from './LockedRowsSection';
import { SUBJECT_FIXED_TITLE } from './option-tab-copy.constants';
import { isSubjectFixedTab } from './is-subject-fixed-tab';
import type { SubjectFixedRowsProps } from './SubjectFixedRows.type';

const SubjectFixedRows = (props: SubjectFixedRowsProps) => {
  const { tab, lockedGroups, valueOf, cellOf, readout } = props;

  if (!isSubjectFixedTab(tab)) return null;

  return (
    <LockedRowsSection
      title={SUBJECT_FIXED_TITLE}
      groups={lockedGroups[tab]}
      valueOf={valueOf}
      cellOf={cellOf}
      readout={readout}
    />
  );
};

export { SubjectFixedRows };
