/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { IconButton } from '../../../../../../design-system/primitives/IconButton';
import { EmptyState } from '../../../../../../design-system/primitives/EmptyState';
import { ListItemRow } from '../../../../../../design-system/composites/ListItemRow';
import { formatBytes } from '../../../../../../../utils/formatBytes';
import type { MsuPack } from './types';

interface MsuPackListProps {
  packs: MsuPack[];
  selected: string | null;
  onSelect: (name: string) => void;
  onDelete: (name: string) => void;
}

const MsuPackList = (props: MsuPackListProps) => {
  const { packs, selected, onSelect, onDelete } = props;

  const handleDeleteClick = useCallback((e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    onDelete(name);
  }, [onDelete]);

  if (packs.length === 0) {
    return (
      <div className="data-list">
        <EmptyState message="No MSU packs imported yet" />
      </div>
    );
  }

  return (
    <div className="data-list">
      {packs.map((pack) => (
        <ListItemRow
          key={pack.name}
          icon="🎵"
          name={pack.name}
          meta={`${pack.fileCount} track${pack.fileCount !== 1 ? 's' : ''} · ${formatBytes(pack.totalSize)}`}
          selected={selected === pack.name}
          onClick={() => onSelect(pack.name)}
          action={
            <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => handleDeleteClick(e, pack.name)}>
              ✕
            </IconButton>
          }
        />
      ))}
    </div>
  );
};

export { MsuPackList };
export type { MsuPackListProps };
