/* @layer renderer-components @kind component */
import { HookshopChip } from '@domains/app/compounds/HookshopChip';
import { Box, Icon, IconButton, EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import type { LanguageSetListProps } from './LanguageSetList.type';

const LanguageSetList = (props: LanguageSetListProps) => {
  const { sets, selected, labelOf, isInstalled, onSelect, onDelete } = props;

  return (
    <Box className="data-list">
      {sets.length === 0 && <EmptyState message="No languages extracted yet" />}
      {sets.map((set) => (
        <ListItemRow
          key={set.id}
          icon={<Icon name="globe" />}
          name={labelOf(set)}
          meta={`${set.lineCount} lines · base ${set.base}${set.origin === 'custom' ? ' · custom' : ''}`}
          columns={isInstalled(set.id) ? [{ primary: <HookshopChip />, align: 'end' }] : undefined}
          selected={selected === set.id}
          onClick={() => onSelect(set.id)}
          action={
            <IconButton
              variant="ghost"
              size="sm"
              label={isInstalled(set.id) ? 'Uninstall' : 'Delete'}
              onClick={(e) => { e.stopPropagation(); onDelete(set.id); }}
            >
              <Icon name="x" />
            </IconButton>
          }
        />
      ))}
    </Box>
  );
};

export { LanguageSetList };
