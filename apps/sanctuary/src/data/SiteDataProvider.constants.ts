/* @layer sanctuary-site @kind constants */
import { ALL_SCOPE_ID } from '../pages/Files/Files.constants';
import { REPORT_SCOPE_IDS } from '../pages/Reports/Reports.constants';
import type { ListSurface } from './site-data-context.type';

const INITIAL_SCOPES: Record<ListSurface, string> = { files: ALL_SCOPE_ID, reports: REPORT_SCOPE_IDS.all };

export { INITIAL_SCOPES };
