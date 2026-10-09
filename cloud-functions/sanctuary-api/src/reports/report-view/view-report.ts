/* @layer root-config @kind logic */
import type { Report } from '@rotp/hub-contracts';
import type { Member } from '../../../../hub-core/auth/require-member';

const viewReport = (report: Report, { access }: Member): Report =>
  access.state === 'admin' ? report : { ...report, contactEmail: null };

export { viewReport };
