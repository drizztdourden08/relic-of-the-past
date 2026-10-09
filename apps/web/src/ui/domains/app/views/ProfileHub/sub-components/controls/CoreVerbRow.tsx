/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { BindingRow } from './BindingRow';
import { CORE_VERB_LABELS } from './controls.constants';
import type { CoreVerbRowProps } from './controls.type';

const CoreVerbRow = ({ verb, groupTitle, binding, icon, onRebind }: CoreVerbRowProps) => {
  const handleRebind = useCallback(() => onRebind(verb), [onRebind, verb]);
  return (
    <BindingRow
      actionLabel={CORE_VERB_LABELS[verb]}
      middleLabel={groupTitle}
      binding={binding}
      bindingIcon={icon}
      onRebind={handleRebind}
    />
  );
};

export { CoreVerbRow };
