/* @layer renderer-components @kind component */
/**
 * CoreBindingsGroup shows the ten core verbs, grouped and rebindable.
 *
 * Shown in BOTH binding tabs on purpose: the four menu verbs drive the pause
 * menu under either scheme, and movement/pause/map are what the modern scheme
 * subtracts from the slot list. Every row goes through the same capture flow
 * as any other binding. There is no fixed, unrebindable row here.
 *
 * `icons` is not optional decoration. A BindingRow given no icon resolves one
 * from the binding's SHAPE alone, which on a pad is the same generic circle for
 * every button, so ten rows came out as six identical circles beside four
 * identical sticks. The device's real artwork is resolved once, per verb, by
 * `useCoreIcons`, through the same family-layer call the SNES mapping rows use.
 */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { BindingRow } from './BindingRow';
import { BindingListHeader } from './BindingListHeader';
import { CORE_VERB_GROUPS, CORE_VERB_LABELS } from './core-verbs';
import type { CoreVerb } from '@shared/input/scheme';
import type { ButtonIcon, CoreBindings } from '@shared/types/controls';
import './CoreBindingsGroup.css';

interface CoreBindingsGroupProps {
  core: CoreBindings;
  /** The device glyph per verb, from `useCoreIcons`. */
  icons: Partial<Record<CoreVerb, ButtonIcon | null>>;
  onRebind: (verb: CoreVerb) => void;
}

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
            <BindingRow
              key={verb}
              actionLabel={CORE_VERB_LABELS[verb]}
              middleLabel={group.title}
              binding={core[verb]}
              bindingIcon={icons[verb]}
              onRebind={() => onRebind(verb)}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export { CoreBindingsGroup };
