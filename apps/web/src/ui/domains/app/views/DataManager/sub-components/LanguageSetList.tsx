/* @layer renderer-components @kind component */
/** The language sets on this computer. A set installed from the Hookshop carries the lock, and its Delete uninstalls. */
import type { LanguageSetSummary } from '@shared/storage/languages';
import { HookshopChip } from '@domains/app/compounds/HookshopChip';
import { Box } from '../../../../../design-system/primitives/Box';
import { IconButton } from '../../../../../design-system/primitives/IconButton';
import { EmptyState } from '../../../../../design-system/primitives/EmptyState';
import { ListItemRow } from '../../../../../design-system/composites/ListItemRow';

interface LanguageSetListProps {
  sets: LanguageSetSummary[];
  selected: string | null;
  labelOf: (set: LanguageSetSummary) => string;
  isInstalled: (id: string) => boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const LanguageSetList = (props: LanguageSetListProps) => {
  const { sets, selected, labelOf, isInstalled, onSelect, onDelete } = props;

  return (
    <Box className="data-list">
      {sets.length === 0 && <EmptyState message="No languages extracted yet" />}
      {sets.map((set) => (
        <ListItemRow
          key={set.id}
          icon="🌐"
          name={labelOf(set)}
          meta={`${set.lineCount} lines · base ${set.base}${set.origin === 'custom' ? ' · custom' : ''}`}
          badge={isInstalled(set.id) ? <HookshopChip /> : undefined}
          selected={selected === set.id}
          onClick={() => onSelect(set.id)}
          action={
            <IconButton
              variant="ghost"
              size="sm"
              label={isInstalled(set.id) ? 'Uninstall' : 'Delete'}
              onClick={(e) => { e.stopPropagation(); onDelete(set.id); }}
            >
              ✕
            </IconButton>
          }
        />
      ))}
    </Box>
  );
};

export { LanguageSetList };
export type { LanguageSetListProps };
