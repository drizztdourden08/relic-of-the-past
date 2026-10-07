/* @layer renderer-components @kind component */
/**
 * Every bound property on THIS node, in one place, with its expression and
 * its live value, as "one screen answering what makes this move?"
 * (`plans/hud-data-binding.html`'s wireframe 5). Read-only: the expression
 * itself is edited from whichever section actually owns that field (Size &
 * Box for `scale`, Appearance for `style.tint.amount`, etc.). This is a map of
 * the node, not a second copy of every field's editor.
 */
import { resolveValue } from '@shared/hud/data';
import { Box } from '@ds/primitives/Box';
import { EmptyState } from '@ds/primitives/EmptyState';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { collectBoundValues } from '../../behavior/bound-values';
import type { HudNode } from '@shared/types/hud';

interface DataSectionProps {
  node: HudNode;
  scope: Readonly<Record<string, number>>;
}

const round = (n: number): number => Math.round(n * 1000) / 1000;

const DataSection = (props: DataSectionProps) => {
  const { node, scope } = props;
  const bound = collectBoundValues(node);

  if (bound.length === 0) {
    // The ONE place the feature is announced. `ValueInput` carries no resting
    // chip and no switch, so someone who does not know a number can be driven
    // is not told by thirty rows. They are told here, once, in the section
    // that is about bindings.
    return <EmptyState size="sm" message="Nothing on this node is driven by the game yet. Type = in any number here to drive it." />;
  }

  return (
    <Box className="hud-inspect__group">
      {bound.map(({ path, expr }) => (
        <Field key={path} size="sm" label={path} className="hud-data-row">
          <Flex direction="column" gap="2xs">
            <Text className="hud-data-row__expr">{expr}</Text>
            <Text className="hud-expr__live">→ {round(resolveValue({ from: 'data', expr }, scope))}</Text>
          </Flex>
        </Field>
      ))}
      <Text className="hud-editor__hint">VARIABLES {Object.entries(scope).map(([k, v]) => `${k} ${round(v)}`).join(' · ')}</Text>
    </Box>
  );
};

export { DataSection };
export type { DataSectionProps };
