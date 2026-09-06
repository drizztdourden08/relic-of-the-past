/* @layer renderer-widgets @kind logic */
/**
 * Turns a flat ScreenAnnotations list into the grouped rows the panel renders.
 *
 * Grouping is by the same four semantic families the overlay colours by, so the
 * panel and the canvas tell the same story in the same order. `unknown` rides
 * along in "other" instead of being dropped. An unmapped mechanic must stay
 * visible in the list too, not only on the canvas.
 */
import type { ScreenAnnotation, AnnotationKind } from '@shared/game/simulation';

type GroupId = 'checks' | 'locks' | 'triggers' | 'ways-out' | 'other';

const GROUP_OF: Partial<Record<AnnotationKind, GroupId>> = {
  chest: 'checks', 'big-chest': 'checks', 'npc-check': 'checks', 'standing-item': 'checks',
  'key-door': 'locks', 'big-key-door': 'locks', 'cell-lock': 'locks',
  shutter: 'locks', bombable: 'locks', 'follower-gate': 'locks',
  'pull-switch': 'triggers', 'kill-trigger': 'triggers',
  'key-carrier': 'triggers', 'big-key-carrier': 'triggers',
  'warp-door': 'ways-out', 'exit-door': 'ways-out', exit: 'ways-out',
};

const GROUP_TITLES: Record<GroupId, string> = {
  checks: 'Checks',
  locks: 'Locks & barriers',
  triggers: 'Triggers',
  'ways-out': 'Ways out',
  other: 'Unmapped',
};

const GROUP_ORDER: GroupId[] = ['checks', 'locks', 'triggers', 'ways-out', 'other'];

interface AnnotationGroup {
  id: GroupId;
  title: string;
  items: ScreenAnnotation[];
}

const groupAnnotations = (items: readonly ScreenAnnotation[]): AnnotationGroup[] => {
  const buckets = new Map<GroupId, ScreenAnnotation[]>();
  for (const item of items) {
    const group = GROUP_OF[item.kind] ?? 'other';
    const bucket = buckets.get(group);
    if (bucket) bucket.push(item);
    else buckets.set(group, [item]);
  }
  return GROUP_ORDER
    .filter((id) => (buckets.get(id)?.length ?? 0) > 0)
    .map((id) => ({ id, title: GROUP_TITLES[id], items: buckets.get(id) ?? [] }));
};

/** `#steps` from an exit's detail line, for sorting ways out by walk distance. */
const stepsOf = (a: ScreenAnnotation): number => {
  const m = /^(\d+) steps$/.exec(a.detail ?? '');
  return m ? Number(m[1]) : Number.MAX_SAFE_INTEGER;
};

export { groupAnnotations, stepsOf };
export type { AnnotationGroup, GroupId };
