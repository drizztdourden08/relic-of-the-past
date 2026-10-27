/* @layer website-site @kind constants */
import { FEATURE_GROUPS } from '../feature-groups.constants';
import { sectionIdsOf } from './section-ids-of';
import { timelineEntriesOf } from './timeline-entries-of';

const TIMELINE_ENTRIES = timelineEntriesOf(FEATURE_GROUPS);

const SECTION_IDS = sectionIdsOf(TIMELINE_ENTRIES);

export { SECTION_IDS, TIMELINE_ENTRIES };
