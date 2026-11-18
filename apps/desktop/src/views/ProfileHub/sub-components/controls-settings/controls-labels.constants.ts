/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ControlsGame } from '@drizztdourden08/brock-input/renderer';

const controlsLabels = (t: I18n['t']): NonNullable<ControlsGame['labels']> => ({
  verbsHeader: t('profiles:controls.labels.verbs-header'),
  groupHeader: t('profiles:controls.labels.group-header'),
  slotsHint: t('profiles:controls.labels.slots-hint'),
});

export { controlsLabels };
