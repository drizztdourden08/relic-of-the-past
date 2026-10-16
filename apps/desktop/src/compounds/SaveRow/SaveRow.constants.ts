/* @layer renderer-components @kind constants */
import type { SaveRowNoticeKind } from './SaveRow.type';

const NAME_MAX_LENGTH = 64;

const NOTICE_LABELS: Readonly<Record<SaveRowNoticeKind, string>> = {
  deleted: 'Deleted',
  saved: 'Saved over',
  loaded: 'Loaded',
};

const UNDO_LABEL = 'Undo';

const EMPTY_LABEL = 'Empty';

const JUST_NOW_LABEL = 'Just now';

const FULL_DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' };

const RELATIVE_UNITS: readonly (readonly [Intl.RelativeTimeFormatUnit, number])[] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3600],
  ['minute', 60],
];

export { EMPTY_LABEL, FULL_DATE_FORMAT, JUST_NOW_LABEL, NAME_MAX_LENGTH, NOTICE_LABELS, RELATIVE_UNITS, UNDO_LABEL };
