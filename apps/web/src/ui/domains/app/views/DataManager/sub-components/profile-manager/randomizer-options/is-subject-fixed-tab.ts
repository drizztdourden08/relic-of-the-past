/* @layer renderer-components @kind logic */
import { SUBJECT_FIXED_TABS } from './option-tab-copy.constants';
import type { OptionTabId } from '@app/hooks/randomizer/option-tab-model';
import type { SubjectFixedTabId } from './option-tab-copy.type';

const isSubjectFixedTab = (tab: OptionTabId): tab is SubjectFixedTabId => SUBJECT_FIXED_TABS.has(tab);

export { isSubjectFixedTab };
