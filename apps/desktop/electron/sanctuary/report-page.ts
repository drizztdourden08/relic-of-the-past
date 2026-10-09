/* @layer electron-main @kind logic */
import { SANCTUARY_API } from '../hub/endpoints';

const reportPageUrl = (reportId: string): string => `${SANCTUARY_API.origin}/reports/${encodeURIComponent(reportId)}`;

export { reportPageUrl };
