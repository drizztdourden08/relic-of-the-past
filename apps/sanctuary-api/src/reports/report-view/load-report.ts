/* @layer root-config @kind logic */
import type { Report } from '@rotp/hub-contracts';
import { notFound } from '@rotp/hub-server';
import { reportsRepo } from '../../db/reports-repo';

const loadReport = async (id: string): Promise<Report> => {
  const report = await reportsRepo.get(id);
  if (!report) throw notFound('No such report.');
  return report;
};

export { loadReport };
