/* @layer renderer-components @kind component */
import { useState, useCallback } from 'react';
import { ImportForm } from './ImportForm';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { Image } from '../../../../../design-system/primitives/Image';
import { IconButton } from '../../../../../design-system/primitives/IconButton';
import { EmptyState } from '../../../../../design-system/primitives/EmptyState';
import { ListItemRow } from '../../../../../design-system/composites/ListItemRow';
import { MasterDetailLayout } from '../../../../../design-system/composites/MasterDetailLayout';
import { useLinkSprites } from '@app/hooks/useLinkSprites';
import { importLinkSprite, deleteLinkSprite } from '@app/lib/storage/link-sprites-store';
import { fetchToBytes } from '@shared/storage/download';
import './LinkSpriteManager.css';

interface LinkSpriteManagerProps {
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const stem = (name: string): string => name.replace(/\.zspr$/i, '');

const LinkSpriteManager = (props: LinkSpriteManagerProps) => {
  const { onDeleteConfirm } = props;
  const { sprites, refresh } = useLinkSprites();
  const [selected, setSelected] = useState<string | null>(null);

  const onFileImport = useCallback(async (fileList: File[]) => {
    let last = '';
    for (const f of fileList) {
      const res = await importLinkSprite(f.name, new Uint8Array(await f.arrayBuffer()));
      if (!res.success) return { success: false, message: res.error ?? 'Import failed' };
      last = stem(res.name ?? f.name);
    }
    await refresh();
    return { success: true, message: `Imported ${last}` };
  }, [refresh]);

  const onUrlImport = useCallback(async (url: string) => {
    const bytes = await fetchToBytes(url);
    const name = decodeURIComponent(url.split('/').pop() || 'sprite.zspr');
    const res = await importLinkSprite(name, bytes);
    if (!res.success) return { success: false, message: res.error ?? 'Import failed' };
    await refresh();
    return { success: true, message: `Imported ${stem(res.name ?? name)}` };
  }, [refresh]);

  const handleDelete = useCallback((e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    onDeleteConfirm('Delete Link Sprite', `Delete "${stem(name)}"? This cannot be undone.`, async () => {
      await deleteLinkSprite(name);
      if (selected === name) setSelected(null);
      await refresh();
    });
  }, [selected, refresh, onDeleteConfirm]);

  const selectedEntry = sprites.find((s) => s.name === selected) ?? null;

  const list = (
    <>
      <ImportForm
        kind="linkSprite"
        accept={['.zspr']}
        placeholder="Paste .zspr download URL…"
        dropLabel="Drop a Link sprite here"
        dropHint=".zspr sprite file"
        onUrlImport={onUrlImport}
        onFileImport={onFileImport}
      />
      <Box className="data-list">
        {sprites.length === 0 && <EmptyState message="No Link sprites imported yet" />}
        {sprites.map((s) => (
          <ListItemRow
            key={s.name}
            icon={s.preview ? <Image className="link-sprite-row__thumb" src={s.preview} alt={s.name} draggable={false} /> : '🧝'}
            name={stem(s.name)}
            selected={selected === s.name}
            onClick={() => setSelected(s.name)}
            action={
              <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => handleDelete(e, s.name)}>✕</IconButton>
            }
          />
        ))}
      </Box>
    </>
  );

  const detail = !selectedEntry ? (
    <Text>Select a Link sprite to preview</Text>
  ) : (
    <Box className="link-sprite-detail">
      {selectedEntry.preview
        ? <Image className="link-sprite-detail__preview" src={selectedEntry.preview} alt={selectedEntry.name} draggable={false} />
        : <Text>No preview available</Text>}
      <Text className="link-sprite-detail__name">{stem(selectedEntry.name)}</Text>
    </Box>
  );

  return <MasterDetailLayout list={list} detail={detail} detailEmpty={!selected} />;
};

export { LinkSpriteManager };
export type { LinkSpriteManagerProps };
