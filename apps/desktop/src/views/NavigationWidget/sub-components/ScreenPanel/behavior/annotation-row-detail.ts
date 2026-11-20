/* @layer renderer-widgets @kind logic */
import type { I18n, Text } from '@drizztdourden08/brock-core/i18n';
import type { ScreenAnnotation } from '@rotp/navigation';

const annotationRowDetail = (t: I18n['t'], text: (value: Text) => string, item: ScreenAnnotation): string => {
  const parts: string[] = [];
  if (item.detail) parts.push(text(item.detail));
  if (item.unreachable) parts.push(t('nav-labels:detail.unreachable'));
  return parts.join(' · ');
};

export { annotationRowDetail };
