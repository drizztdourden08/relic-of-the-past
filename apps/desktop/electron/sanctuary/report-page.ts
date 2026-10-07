/* @layer electron-main @kind logic */
/** The site page of one report, for the "See it in the Sanctuary" button. */
import { SANCTUARY_API } from '../hub/endpoints';

const reportPageUrl = (reportId: string): string => `${SANCTUARY_API.origin}/reports/${encodeURIComponent(reportId)}`;

export { reportPageUrl };
