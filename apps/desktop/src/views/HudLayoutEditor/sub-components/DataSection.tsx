/* @layer renderer-components @kind component */
import { resolveValue } from '@rotp/hud';
import { Box, EmptyState, Field, Flex, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { collectBoundValues } from '@app/hud-layout-editing/bound-values';
import type { DataSectionProps } from './DataSection.type';
import { useT } from '@drizztdourden08/brock-react';

const round = (n: number): number => Math.round(n * 1000) / 1000;

const DataSection = (props: DataSectionProps) => {
  const t = useT();
  const { node, scope } = props;
  const bound = collectBoundValues(node);

  if (bound.length === 0) {
    return <EmptyState size="sm" message={t('hud-editor:data-section.message.nothing-on-this-node-is')} />;
  }

  return (
    <Box className="hud-inspect__group">
      {bound.map(({ path, expr }) => (
        <Field key={path} size="sm" label={path} className="hud-data-row">
          <Flex direction="column" gap="2xs">
            <Text className="hud-data-row__expr">{expr}</Text>
            <Text className="hud-expr__live">
              <Icon name="arrow-right" size={12} aria-hidden /> {round(resolveValue({ from: 'data', expr }, scope))}
            </Text>
          </Flex>
        </Field>
      ))}
      <Text className="hud-editor__hint">VARIABLES {Object.entries(scope).map(([k, v]) => `${k} ${round(v)}`).join(' · ')}</Text>
    </Box>
  );
};

export { DataSection };
