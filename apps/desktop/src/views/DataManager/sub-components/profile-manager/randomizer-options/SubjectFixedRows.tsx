/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { LockedRowsSection } from './LockedRowsSection';
import { isSubjectFixedTab } from './is-subject-fixed-tab';
import type { SubjectFixedRowsProps } from './SubjectFixedRows.type';

const SubjectFixedRows = (props: SubjectFixedRowsProps) => {
  const { tab, lockedGroups, valueOf, cellOf, readout } = props;
  const t = useT();

  if (!isSubjectFixedTab(tab)) return null;

  return (
    <LockedRowsSection
      title={t('data-manager:option-tabs.fixed')}
      groups={lockedGroups[tab]}
      valueOf={valueOf}
      cellOf={cellOf}
      readout={readout}
    />
  );
};

export { SubjectFixedRows };
