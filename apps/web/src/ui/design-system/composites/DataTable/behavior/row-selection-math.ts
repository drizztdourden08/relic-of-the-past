/* @layer renderer-components @kind logic */
/**
 * The set arithmetic behind multi-selection. `order` is the rows as drawn, top to
 * bottom, so a range follows what the user sees, groups and all.
 */
import type { SelectAllState } from '../DataTable.type';

/** The set with `id` flipped. */
const toggledId = (ids: ReadonlySet<string>, id: string): Set<string> => {
  const next = new Set(ids);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

/** Every id from `from` to `to`, either way round. An anchor no longer drawn gives just `to`. */
const rangeBetween = (order: readonly string[], from: string, to: string): string[] => {
  const start = order.indexOf(from);
  const end = order.indexOf(to);
  if (start < 0 || end < 0) return [to];
  return order.slice(Math.min(start, end), Math.max(start, end) + 1);
};

const allStateOf = (order: readonly string[], ids: ReadonlySet<string>): SelectAllState => {
  const picked = order.filter((id) => ids.has(id)).length;
  if (picked === 0) return 'none';
  return picked === order.length ? 'all' : 'some';
};

/** The header box: all shown rows in, or, when they already all are, all of them out. */
const checkAllOf = (order: readonly string[], ids: ReadonlySet<string>): Set<string> => {
  if (allStateOf(order, ids) !== 'all') return new Set([...ids, ...order]);
  const shown = new Set(order);
  return new Set([...ids].filter((id) => !shown.has(id)));
};

export { toggledId, rangeBetween, allStateOf, checkAllOf };
