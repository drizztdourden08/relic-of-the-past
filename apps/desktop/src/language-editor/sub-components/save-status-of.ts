/* @layer renderer-components @kind logic */
import type { BundleHeaderProps } from './BundleHeader.type';
import type { SaveStatus } from './SaveStatusBadge.type';

const saveStatusOf = (props: Pick<BundleHeaderProps, 'saveError' | 'readOnly' | 'saving' | 'dirty'>): SaveStatus => {
  const { saveError, readOnly, saving, dirty } = props;
  if (saveError) return { tone: 'danger', text: saveError };
  if (readOnly) return { tone: 'neutral', text: 'Read only' };
  if (saving) return { tone: 'neutral', text: 'Saving...' };
  if (dirty) return { tone: 'warning', text: 'Not saved yet' };
  return { tone: 'success', text: 'Saved' };
};

export { saveStatusOf };
