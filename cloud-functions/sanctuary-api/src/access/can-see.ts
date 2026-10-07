/* @layer root-config @kind logic */
/** The two questions every files and reports route asks of a caller's rights. */
import type { FileType, Rights } from '../../../../shared/sanctuary';

const canSeeType = (rights: Rights, type: FileType): boolean => rights.admin || rights.fileTypes.includes(type);

const canSeeReports = (rights: Rights): boolean => rights.admin || rights.reports;

export { canSeeType, canSeeReports };
