/* @layer renderer-components @kind component */
import { TEXT_SUMMARY } from '../LanguageEditor.constants';
import { TextGroupsTab } from './text-groups';
import { UnbuiltPane } from './UnbuiltPane';
import type { TextPaneProps } from './TextPane.type';

const TextPane = (props: TextPaneProps) => {
  const { text, readOnly } = props;
  return (
    <UnbuiltPane summary={TEXT_SUMMARY}>
      <TextGroupsTab
        groups={text.groups}
        activeGroup={text.activeGroup}
        values={text.values}
        readOnly={readOnly}
        onSelectGroup={text.selectGroup}
        onChangeValue={text.setValue}
      />
    </UnbuiltPane>
  );
};

export { TextPane };
