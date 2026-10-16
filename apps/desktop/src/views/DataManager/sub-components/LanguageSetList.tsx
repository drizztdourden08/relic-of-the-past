/* @layer renderer-components @kind component */
import { HookshopChip } from '@app/compounds/HookshopChip';
import { Icon, IconButton, EmptyState, Spinner, Stack } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import type { LanguageSetListProps } from './LanguageSetList.type';

const LanguageSetList = (props: LanguageSetListProps) => {
  const { sets, loading, selected, labelOf, isInstalled, onSelect, onDelete } = props;

  return (
    <Stack gap="xs">
      {loading && <Spinner />}
      {!loading && sets.length === 0 && <EmptyState message="No languages extracted yet" />}
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
    </Stack>
  );
};

export { LanguageSetList };
