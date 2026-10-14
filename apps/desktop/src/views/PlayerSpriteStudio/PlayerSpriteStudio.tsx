/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { useWearing } from '@rotp/design/packs';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { useConfirmUninstall } from '../InstalledOriginBar';
import { useSpriteLibrary } from './behavior/useSpriteLibrary';
import { useSpriteDraft } from './behavior/useSpriteDraft';
import { useSpriteExport } from './behavior/useSpriteExport';
import { useStudioTask } from './behavior/useStudioTask';
import { useStudioActions } from './behavior/useStudioActions';
import { SpriteLibraryList } from './sub-components/SpriteLibraryList';
import { StudioDetail } from './sub-components/StudioDetail';
import './PlayerSpriteStudio.css';
import type { PlayerSpriteStudioProps } from './PlayerSpriteStudio.type';

const PlayerSpriteStudio = (props: PlayerSpriteStudioProps) => {
  const { romStatuses, onDeleteConfirm } = props;

  const romWithAssets = useMemo(() => romStatuses.find((r) => r.hasAssets)?.romFile ?? null, [romStatuses]);
  const library = useSpriteLibrary();
  const draft = useSpriteDraft(romWithAssets);
  const wearing = useWearing();
  const exporter = useSpriteExport();
  const { busy, error, run } = useStudioTask();

  const sheet = draft.draft?.sheet ?? null;
  const openFile = draft.draft?.file ?? null;
  const { pack: installed, packFor } = useInstalledKind('character', openFile);
  const { confirmUninstall, uninstallError } = useConfirmUninstall(onDeleteConfirm);
  const actions = useStudioActions({ openFile, packFor, confirmUninstall, onDeleteConfirm, run, library, draft });

  const list = (
    <SpriteLibraryList
      entries={library.entries}
      selected={openFile}
      canCreate={Boolean(romWithAssets)}
      isInstalled={actions.isInstalled}
      onSelect={(name) => run(() => draft.open(name))}
      onCreate={() => run(draft.createNew)}
      onDelete={actions.handleDelete}
      onUrlImport={actions.handleUrlImport}
      onFileImport={library.importFiles}
    />
  );

  const detail = !sheet ? null : (
    <StudioDetail
      sheet={sheet}
      openFile={openFile}
      installed={installed}
      busy={busy}
      status={error ?? uninstallError}
      draft={draft}
      library={library}
      exporter={exporter}
      wearing={wearing}
      run={run}
      onOpenAfter={actions.openAfter}
      onUninstalled={actions.handleUninstalled}
    />
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
