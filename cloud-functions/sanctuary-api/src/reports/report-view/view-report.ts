/* @layer root-config @kind logic */
import type { Report } from '@rotp/hub-contracts';
import type { Member } from '@rotp/hub-server';

const viewReport = (report: Report, { access }: Member): Report =>
  access.state === 'admin' ? report : { ...report, contactEmail: null };

export { viewReport };
