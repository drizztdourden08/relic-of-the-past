/* @layer root-config @kind logic */
import { canSeeReports } from '@rotp/hub-contracts';
import type { Report } from '@rotp/hub-contracts';
import { notFound } from '@rotp/hub-server';
import type { Member } from '@rotp/hub-server';
import { loadReport } from './load-report';

const loadVisibleReport = async (id: string, { rights }: Member): Promise<Report> => {
  if (!canSeeReports(rights)) throw notFound('No such report.');
  return loadReport(id);
};

export { loadVisibleReport };
