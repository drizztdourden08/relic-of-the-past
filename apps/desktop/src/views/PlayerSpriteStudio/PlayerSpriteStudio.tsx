/* @layer renderer-components @kind component */
import { useState, useMemo, useCallback } from 'react';
import { Box, EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { useWearing, SpriteSheetViewer } from '@rotp/design/packs';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { InstalledOriginBar, useConfirmUninstall } from '../InstalledOriginBar';
import { useSpriteLibrary } from './behavior/useSpriteLibrary';
import { useSpriteDraft } from './behavior/useSpriteDraft';
import { useSpriteExport } from './behavior/useSpriteExport';
import { SpriteLibraryList } from './sub-components/SpriteLibraryList';
import { PaletteEditor } from './sub-components/PaletteEditor';
import { StudioToolbar } from './sub-components/StudioToolbar';
import { fetchToBytes } from '@app/download/download';
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
  const [error, setError] = useState<string | null>(null);

  const sheet = draft.draft?.sheet ?? null;
  const openFile = draft.draft?.file ?? null;
  const { pack: installed, packFor } = useInstalledKind('character', openFile);
  const { confirmUninstall, uninstallError } = useConfirmUninstall(onDeleteConfirm);
  const readOnly = installed !== null;

  const run = useCallback(async (task: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try { await task(); } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally { setBusy(false); }
  }, []);

  const handleUrlImport = useCallback(async (url: string) => {
    const bytes = await fetchToBytes(url);
    const name = decodeURIComponent(url.split('/').pop() || 'sprite.zspr');
    return library.importBytes(name, bytes);
  }, [library]);

  const isInstalled = useCallback((name: string) => packFor(name) !== null, [packFor]);

  const handleDelete = useCallback((name: string) => {
    const owner = packFor(name);
    if (owner) {
      confirmUninstall(owner, () => {
        if (openFile === name) draft.close();
        void library.refresh();
      });
      return;
    }
    const message = `Delete "${name}"? Any profile using it goes back to the original sprite. This cannot be undone.`;
    onDeleteConfirm('Delete player sprite', message, async () => {
      if (openFile === name) draft.close();
      await library.remove(name);
    });
  }, [packFor, confirmUninstall, openFile, onDeleteConfirm, draft, library]);

  const openAfter = useCallback((name: string) => {
    void run(async () => { await library.refresh(); await draft.open(name); });
  }, [run, library, draft]);

  const handleUninstalled = useCallback(() => {
    draft.close();
    void library.refresh();
  }, [draft, library]);

  const list = (
    <SpriteLibraryList
      entries={library.entries}
      selected={openFile}
      canCreate={!!romWithAssets}
      isInstalled={isInstalled}
      onSelect={(name) => run(() => draft.open(name))}
      onCreate={() => run(draft.createNew)}
      onDelete={handleDelete}
      onUrlImport={handleUrlImport}
      onFileImport={library.importFiles}
    />
  );

  const status = error ?? uninstallError;

  const detail = !sheet ? null : (
    <Box className="sprite-studio">
      {installed && (
        <InstalledOriginBar pack={installed} onDuplicated={openAfter} onUpdated={openAfter} onUninstalled={handleUninstalled} />
      )}
      <StudioToolbar
        meta={sheet.meta}
        file={openFile}
        dirty={draft.dirty}
        applied={draft.applied}
        busy={busy}
        readOnly={readOnly}
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
      {status && <Text className="sprite-studio__status sprite-studio__status--error">{status}</Text>}

      <SpriteSheetViewer
        sheet={sheet}
        wearing={wearing}
        aside={(
          <PaletteEditor
            sheet={sheet}
            outfit={wearing.outfit}
            readOnly={readOnly}
            onColor={(index, word) => draft.setColor(wearing.outfit, index, word)}
            onGloveColor={draft.setGloveColor}
            onReset={(index) => draft.resetColor(wearing.outfit, index)}
          />
        )}
      />
    </Box>
  );

  return (
    <ListDetailLayout
      className="sprite-studio-layout"
      list={list}
      detail={detail}
      emptyDetail={<EmptyState message="Select a sprite to open it, or create one from the stock sheet." />}
    />
  );
};

export { PlayerSpriteStudio };
