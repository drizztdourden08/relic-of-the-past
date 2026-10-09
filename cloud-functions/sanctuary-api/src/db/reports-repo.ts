/* @layer root-config @kind logic */
import type { Report } from '@rotp/hub-contracts';
import { decodeCursor, encodeCursor } from '../../../hub-core/db/firestore';
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
  let query = reports().orderBy('createdAt', 'desc').limit(pageSize);
  if (mineUserId) query = query.where('reporter.userId', '==', mineUserId);
  if (state) query = query.where('issue.state', '==', state);
  const after = decodeCursor(cursor);
  if (after !== null) query = query.startAfter(after);
  const snap = await query.get();
  const items = snap.docs.map((doc) => doc.data() as Report);
  const last = items[items.length - 1];
  return { items, nextCursor: items.length === pageSize && last ? encodeCursor(last.createdAt) : null };
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
