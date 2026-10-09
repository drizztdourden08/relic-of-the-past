/* @layer renderer-components @kind component */
import { resolveValue } from '@shared/hud/data';
import { Box } from '@ds/primitives/Box';
import { EmptyState } from '@ds/primitives/EmptyState';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { collectBoundValues } from '../../behavior/bound-values';
import type { DataSectionProps } from './DataSection.type';

const round = (n: number): number => Math.round(n * 1000) / 1000;

const DataSection = (props: DataSectionProps) => {
  const { node, scope } = props;
  const bound = collectBoundValues(node);

  if (bound.length === 0) {
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
export type { DataSectionProps } from './DataSection.type';
