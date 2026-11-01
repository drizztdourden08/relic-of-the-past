/* @layer root-config @kind logic */
import type { Query } from '@google-cloud/firestore';
import type { Report } from '@rotp/hub-contracts';
import { queryPage } from '@rotp/hub-server';
import { sanctuaryCollection } from './collections';
import type { ReportFilter, ReportPage, ReportPatch } from './reports-repo.type';

const reports = () => sanctuaryCollection('reports');

const create = async (report: Report): Promise<void> => {
  await reports().doc(report.id).set(report);
};

const get = async (id: string): Promise<Report | null> => {
  const snap = await reports().doc(id).get();
  return snap.exists ? (snap.data() as Report) : null;
};

const update = async (id: string, patch: ReportPatch): Promise<void> => {
  await reports().doc(id).update(patch);
};

const list = async ({ mineUserId, state, cursor }: ReportFilter, pageSize: number): Promise<ReportPage> => {
  let query: Query = reports();
  if (mineUserId) query = query.where('reporter.userId', '==', mineUserId);
  if (state) query = query.where('issue.state', '==', state);
  return queryPage(query, cursor, pageSize, (data) => data as Report);
};

const listForSweep = async (): Promise<Report[]> => {
  const snap = await reports().get();
  return snap.docs.map((doc) => doc.data() as Report);
};

const remove = async (id: string): Promise<void> => {
  await reports().doc(id).delete();
};

const extend = async (id: string, extendedUntil: number, expiresAt: number, by: string): Promise<void> => {
  await reports().doc(id).update({ extendedUntil, expiresAt, extendedBy: by });
};

const reportsRepo = { create, get, update, list, listForSweep, remove, extend };

export { reportsRepo };
