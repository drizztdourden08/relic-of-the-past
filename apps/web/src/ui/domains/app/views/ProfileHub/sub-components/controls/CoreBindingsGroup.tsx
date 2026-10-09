/* @layer renderer-components @kind component */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { BindingListHeader } from './BindingListHeader';
import { CoreVerbRow } from './CoreVerbRow';
import { CORE_VERB_GROUPS } from './controls.constants';
import type { CoreBindingsGroupProps } from './controls.type';
import './CoreBindingsGroup.css';

const CoreBindingsGroup = ({ core, icons, onRebind }: CoreBindingsGroupProps) => {
  return (
    <Box className="core-bindings">
      <BindingListHeader middleLabel="Group" />
      {CORE_VERB_GROUPS.map((group) => (
        <Box key={group.id} className="core-bindings__group">
          <Box className="core-bindings__group-head">
            <Text className="core-bindings__group-title">{group.title}</Text>
            {group.hint && <Text variant="caption" className="core-bindings__group-hint">{group.hint}</Text>}
          </Box>
          {group.verbs.map((verb) => (
            <CoreVerbRow
              key={verb}
              verb={verb}
              groupTitle={group.title}
              binding={core[verb]}
              icon={icons[verb]}
              onRebind={onRebind}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export { CoreBindingsGroup };
