/* @layer renderer-components @kind component */
import { resolveValue } from '@rotp/hud';
import { Box, EmptyState, Field, Flex, Text } from '@drizztdourden08/tessera/primitives';
import { collectBoundValues } from '@app/hud-layout-editing/bound-values';
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
