/* @layer renderer-components @kind constants */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SelectOption } from '@drizztdourden08/tessera/primitives';

const autoOptionOf = (t: I18n['t']): SelectOption => ({ value: '', label: t('language-editor:settings.automatic') });

export { autoOptionOf };
