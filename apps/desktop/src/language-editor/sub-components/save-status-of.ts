/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SaveStatus, SaveStatusBadgeProps } from './SaveStatusBadge.type';

const saveStatusOf = (t: I18n['t'], props: SaveStatusBadgeProps): SaveStatus => {
  const { saveError, readOnly, saving, dirty } = props;
  if (saveError) return { tone: 'danger', text: saveError };
  if (readOnly) return { tone: 'neutral', text: t('language-editor:save-status.read-only') };
  if (saving) return { tone: 'neutral', text: t('language-editor:save-status.saving') };
  if (dirty) return { tone: 'warning', text: t('language-editor:save-status.unsaved') };
  return { tone: 'success', text: t('language-editor:save-status.saved') };
};

export { saveStatusOf };
