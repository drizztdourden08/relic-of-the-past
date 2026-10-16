/* @layer renderer-components @kind component */
import { Grid, Icon, SectionHeader, Stack } from '@drizztdourden08/tessera/primitives';
import { ItemCard } from '@drizztdourden08/tessera/composites';
import { SECTION_COLUMN_WIDTH, SECTION_ICON_SIZE } from './DataSections.constants';
import type { DataSectionsProps } from './DataSections.type';

const DataSections = (props: DataSectionsProps) => {
  const { groups, onOpen } = props;

  return (
    <Stack gap="lg">
      {groups.map((group) => (
        <Stack key={group.id} as="section" gap="sm" aria-label={group.label}>
          <SectionHeader level={3} title={group.label} />
          <Grid minColWidth={SECTION_COLUMN_WIDTH} gap="md">
            {group.items.map((item) => (
              <ItemCard
                key={item.id}
                level={4}
                layout="left"
                mediaTone="neutral"
                media={<Icon name={item.icon} size={SECTION_ICON_SIZE} />}
                title={item.title}
                details={[item.description]}
                onOpen={() => onOpen(item.id)}
              />
            ))}
          </Grid>
        </Stack>
      ))}
    </Stack>
  );
};

export { DataSections };
