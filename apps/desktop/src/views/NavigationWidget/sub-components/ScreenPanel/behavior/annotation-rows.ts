/* @layer renderer-widgets @kind logic */
import type { ScreenAnnotation } from '@rotp/navigation';
import { GROUP_OF, GROUP_ORDER, GROUP_TITLES } from '../ScreenPanel.constants';
import type { AnnotationGroup, GroupId } from '../ScreenPanel.type';

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

export { groupAnnotations };
