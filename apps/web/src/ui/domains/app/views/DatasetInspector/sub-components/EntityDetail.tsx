/* @layer renderer-app @kind component */
import type { EntityKind } from '@shared/game/data';
import { Box, Divider, Stack, Text } from '@ds/primitives';
import { getRelationships } from './relationships';
import { RecordLink } from './RecordLink';
import type { DatasetSearchResult } from '../DatasetInspector.type';

interface EntityDetailProps {
  kind: EntityKind;
  selected?: DatasetSearchResult;
  resolveLabel: (id?: string) => string;
  onNavigate: (id: string) => void;
}

const EntityDetail = (props: EntityDetailProps) => {
  const { kind, selected, resolveLabel, onNavigate } = props;

  if (!selected) {
    return <Box className="dataset-inspector__detail"><Text className="dataset-inspector__empty">Select an entity.</Text></Box>;
  }

  const groups = getRelationships(kind, selected.raw);

  return (
    <Box className="dataset-inspector__detail">
      {groups.length > 0 && (
        <>
          <Stack gap="sm" className="dataset-inspector__relationships">
            {groups.map(group => (
              <Box key={group.label} className="dataset-inspector__relationship-group">
                <Text variant="label">{group.label}</Text>
                <Box className="dataset-inspector__relationship-chips">
                  {group.ids.map(id => (
                    <RecordLink key={id} id={id} label={resolveLabel(id)} onNavigate={onNavigate} />
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
          <Divider />
        </>
      )}
      <Text as="pre" className="dataset-inspector__json">{JSON.stringify(selected.raw, null, 2)}</Text>
    </Box>
  );
};

export { EntityDetail };
