import { useCallback } from 'react';
import { IconButton } from '../../../../primitives/IconButton';
import { formatBytes } from '../../../../../utils/formatBytes';
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
        <div className="data-list-empty" style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
          No MSU packs imported yet
        </div>
      </div>
    );
  }

  return (
    <div className="data-list">
      {packs.map((pack) => (
        <div
          key={pack.name}
          className={`data-list-item ${selected === pack.name ? 'data-list-item--selected' : ''}`}
          onClick={() => onSelect(pack.name)}
        >
          <span className="data-list-item__icon">🎵</span>
          <div className="data-list-item__info">
            <div className="data-list-item__name">{pack.name}</div>
            <div className="data-list-item__meta">
              {pack.fileCount} track{pack.fileCount !== 1 ? 's' : ''} · {formatBytes(pack.totalSize)}
            </div>
          </div>
          <div className="data-list-item__action">
            <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => handleDeleteClick(e, pack.name)}>
              ✕
            </IconButton>
          </div>
        </div>
      ))}
    </div>
  );
};

export { MsuPackList };
export type { MsuPackListProps };
