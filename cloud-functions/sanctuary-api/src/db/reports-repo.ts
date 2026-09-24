/* @layer root-config @kind logic */
import type { Report } from '../../../../shared/sanctuary';
import { collection, decodeCursor, encodeCursor } from './firestore';

type ReportPage = { items: Report[]; nextCursor: string | null };
type ReportFilter = { mineUserId: string | null; state: Report['issue']['state'] | null; cursor: string | undefined };
type ReportPatch = Partial<Pick<Report, 'zip' | 'issue' | 'expiresAt' | 'extendedUntil'>>;

const reports = () => collection('reports');

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

/** Every report whose issue was open at the last sweep, plus closed ones still holding a zip. */
const listForSweep = async (): Promise<Report[]> => {
  const snap = await reports().get();
  return snap.docs.map((doc) => doc.data() as Report);
};

const remove = async (id: string): Promise<void> => {
  await reports().doc(id).delete();
};

/** Writes the new dates and who asked; `extendedBy` is an audit field the shared type does not carry. */
const extend = async (id: string, extendedUntil: number, expiresAt: number, by: string): Promise<void> => {
  await reports().doc(id).update({ extendedUntil, expiresAt, extendedBy: by });
};

const reportsRepo = { create, get, update, list, listForSweep, remove, extend };

export { reportsRepo };
export type { ReportPage, ReportFilter, ReportPatch };
