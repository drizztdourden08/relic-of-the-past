/* @layer renderer-components @kind component */
/**
 * The fixed rows a subject tab keeps beneath its live ones, for whichever
 * tabs have some. Which tabs those are is the copy map's answer, so a subject
 * that grows a fixed section is one entry there and nothing in the layout.
 * A tab with no entry renders nothing.
 */
import { LockedRowsSection } from './LockedRowsSection';
import { SUBJECT_FIXED_TITLE, isSubjectFixedTab } from './option-tab-copy';
import type { LockedGroupsByTab, OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import type { ImpactCell } from '@domains/app/compounds/PoolImpactCell';
import type { ApOptionDef, ApOptionValue } from '@shared/randomizer/ap-world/options.type';

interface SubjectFixedRowsProps {
  tab: OptionTabId;
  /** The fixed sections each tab that shows some owns, already split. */
  lockedGroups: LockedGroupsByTab;
  valueOf: (option: ApOptionDef) => ApOptionValue;
  cellOf: (key: string) => ImpactCell;
}

const SubjectFixedRows = (props: SubjectFixedRowsProps) => {
  const { tab, lockedGroups, valueOf, cellOf } = props;

  if (!isSubjectFixedTab(tab)) return null;

  return (
    <LockedRowsSection
      title={SUBJECT_FIXED_TITLE}
      groups={lockedGroups[tab]}
      valueOf={valueOf}
      cellOf={cellOf}
    />
  );
};

export { SubjectFixedRows };
export type { SubjectFixedRowsProps };
