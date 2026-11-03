/* @layer hub-core @kind logic */
import type { Query } from '@google-cloud/firestore';
import { decodeCursor } from './decode-cursor';
import { pageOf } from './page-of';

const queryPage = async <T extends { createdAt: number }>(
  query: Query,
  cursor: string | undefined,
  pageSize: number,
  toItem: (data: unknown) => T,
): Promise<{ items: T[]; nextCursor: string | null }> => {
  let ordered = query.orderBy('createdAt', 'desc').limit(pageSize);
  const after = decodeCursor(cursor);
  if (after !== null) ordered = ordered.startAfter(after);
  const snap = await ordered.get();
  return pageOf(snap.docs.map((doc) => toItem(doc.data())), pageSize);
};

export { queryPage };
