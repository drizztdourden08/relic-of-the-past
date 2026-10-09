/* @layer renderer-components @kind component */
import { CaseListEditor } from '../CaseListEditor';
import type { SwitchContentProps } from './SwitchContent.type';

const SwitchContent = (props: SwitchContentProps) => {
  const { spec, onChange, scope, insideRepeat, glyphPacks, selectedId, onSelectNode } = props;
  return (
    <CaseListEditor
      spec={spec}
      onChange={onChange}
      scope={scope}
      insideRepeat={insideRepeat}
      glyphPacks={glyphPacks}
      selectedId={selectedId}
      onSelectNode={onSelectNode}
    />
  );
};

export { SwitchContent };
export type { SwitchContentProps } from './SwitchContent.type';
