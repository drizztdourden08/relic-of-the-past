/* @layer renderer-app @kind constants */
import checks from '@app/locales/en/record-checks.json';
import items from '@app/locales/en/record-items.json';
import places from '@app/locales/en/record-places.json';
import screens from '@app/locales/en/record-screens.json';
import type { RecordKind } from './record-text.type';

const RECORD_CATALOGS: Record<RecordKind, { namespace: string; table: Record<string, string> }> = {
  check: { namespace: 'record-checks', table: checks },
  item: { namespace: 'record-items', table: items },
  place: { namespace: 'record-places', table: places },
  screen: { namespace: 'record-screens', table: screens },
};

export { RECORD_CATALOGS };
