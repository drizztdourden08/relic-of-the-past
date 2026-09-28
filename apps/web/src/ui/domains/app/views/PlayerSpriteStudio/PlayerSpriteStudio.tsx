/* @layer renderer-components @kind component */
import { useState, useMemo, useCallback } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { MasterDetailLayout } from '@ds/composites/MasterDetailLayout';
import { useWearing } from '@domains/packs/character/behavior/useWearing';
import { SpriteSheetViewer } from '@domains/packs/character/compounds/SpriteSheetViewer';
import { useSpriteLibrary } from './behavior/useSpriteLibrary';
import { useSpriteDraft } from './behavior/useSpriteDraft';
import { useSpriteExport } from './behavior/useSpriteExport';
import { SpriteLibraryList } from './sub-components/SpriteLibraryList';
import { PaletteEditor } from './sub-components/PaletteEditor';
import { StudioToolbar } from './sub-components/StudioToolbar';
import { fetchToBytes } from '@shared/storage/download';
import './PlayerSpriteStudio.css';
import type { PlayerSpriteStudioProps } from './PlayerSpriteStudio.type';

const PlayerSpriteStudio = (props: PlayerSpriteStudioProps) => {
  const { romStatuses, onDeleteConfirm } = props;

  const romWithAssets = useMemo(() => romStatuses.find((r) => r.hasAssets)?.romFile ?? null, [romStatuses]);
  const library = useSpriteLibrary();
  const draft = useSpriteDraft(romWithAssets);
  const wearing = useWearing();
  const exporter = useSpriteExport();

  const [busy, setBusy] = useState(false);

  const sheet = draft.draft?.sheet ?? null;

  const run = useCallback(async (task: () => Promise<unknown>) => {
    setBusy(true);
    try { await task(); } finally { setBusy(false); }
  }, []);

  const handleUrlImport = useCallback(async (url: string) => {
    const bytes = await fetchToBytes(url);
    const name = decodeURIComponent(url.split('/').pop() || 'sprite.zspr');
    return library.importBytes(name, bytes);
  }, [library]);

  const handleDelete = useCallback((name: string) => {
    const message = `Delete "${name}"? Any profile using it goes back to the original sprite. This cannot be undone.`;
    onDeleteConfirm('Delete player sprite', message, async () => {
      if (draft.draft?.file === name) draft.close();
      await library.remove(name);
    });
  }, [onDeleteConfirm, draft, library]);

  const list = (
    <SpriteLibraryList
      entries={library.entries}
      selected={draft.draft?.file ?? null}
      canCreate={!!romWithAssets}
      onSelect={(name) => run(() => draft.open(name))}
      onCreate={() => run(draft.createNew)}
      onDelete={handleDelete}
      onUrlImport={handleUrlImport}
      onFileImport={library.importFiles}
    />
  );

  const detail = !sheet ? (
    <Text>Select a sprite to open it, or create one from the stock sheet.</Text>
  ) : (
    <Box className="sprite-studio">
      <StudioToolbar
        meta={sheet.meta}
        file={draft.draft?.file ?? null}
        dirty={draft.dirty}
        applied={draft.applied}
        busy={busy}
        onMeta={(meta) => draft.patch({ meta })}
        onSave={() => run(async () => { await draft.save(); await library.refresh(); })}
        onSaveAs={(container) => run(async () => {
          await draft.save(`${sheet.meta.name || 'sprite'}.${container}`);
          await library.refresh();
        })}
        onExport={(container) => run(() => exporter.exportSheet(sheet, container))}
        onRevert={draft.revert}
        onClose={draft.close}
      />
      {exporter.status && <Text className="sprite-studio__status">{exporter.status}</Text>}

      <SpriteSheetViewer
        sheet={sheet}
        wearing={wearing}
        aside={(
          <PaletteEditor
            sheet={sheet}
            outfit={wearing.outfit}
            onColor={(index, word) => draft.setColor(wearing.outfit, index, word)}
            onGloveColor={draft.setGloveColor}
            onReset={(index) => draft.resetColor(wearing.outfit, index)}
          />
        )}
      />
    </Box>
  );

  return <MasterDetailLayout className="sprite-studio-layout" list={list} detail={detail} detailEmpty={!sheet} />;
};

export { PlayerSpriteStudio };
