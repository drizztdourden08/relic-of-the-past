/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { CreateListPane } from '@app/compounds/CreateListPane';
import { useCreateFlow } from '@app/hooks/useCreateFlow';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { useConfirmUninstall } from '../InstalledOriginBar';
import { useSpriteLibrary } from './behavior/useSpriteLibrary';
import { useSpriteDraft } from './behavior/useSpriteDraft';
import { useSpriteExport } from './behavior/useSpriteExport';
import { useStudioTask } from './behavior/useStudioTask';
import { useStudioActions } from './behavior/useStudioActions';
import { SpriteLibraryList } from './sub-components/SpriteLibraryList';
import { SpriteWorkArea } from './sub-components/SpriteWorkArea';
import { CharacterCreateWizard, NEW_SPRITE_ID } from './sub-components/CharacterCreateWizard';
import { EMPTY_EDITOR } from './PlayerSpriteStudio.constants';
import type { PlayerSpriteStudioProps } from './PlayerSpriteStudio.type';
import './PlayerSpriteStudio.css';

const PlayerSpriteStudio = (props: PlayerSpriteStudioProps) => {
  const { romStatuses, onDeleteConfirm } = props;

  const romWithAssets = useMemo(() => romStatuses.find((r) => r.hasAssets)?.romFile ?? null, [romStatuses]);
  const library = useSpriteLibrary();
  const draft = useSpriteDraft(romWithAssets);
  const exporter = useSpriteExport();
  const { busy, error, run } = useStudioTask();

  const sheet = draft.draft?.sheet ?? null;
  const openFile = draft.draft?.file ?? null;
  const { pack: installed, packFor } = useInstalledKind('character', openFile);
  const { confirmUninstall, uninstallError } = useConfirmUninstall(onDeleteConfirm);
  const actions = useStudioActions({ openFile, packFor, confirmUninstall, onDeleteConfirm, run, library, draft });
  const problem = error ?? uninstallError;
  const flow = useCreateFlow({ onSelect: (name) => { if (name !== NEW_SPRITE_ID) void run(() => draft.open(name)); } });

  const list = (
    <CreateListPane label="New character" creating={flow.creating} onCreate={flow.start}>
      <SpriteLibraryList
        entries={library.entries}
        loading={library.loading}
        selected={flow.creating ? null : openFile}
        error={sheet ? null : problem}
        isInstalled={actions.isInstalled}
        onSelect={flow.select}
        onDelete={actions.handleDelete}
      />
    </CreateListPane>
  );

  const workArea = sheet && (
    <SpriteWorkArea
      sheet={sheet}
      installed={installed}
      busy={busy}
      error={problem}
      draft={draft}
      library={library}
      exporter={exporter}
      run={run}
      onOpenAfter={actions.openAfter}
      onUninstalled={actions.handleUninstalled}
    />
  );

  const detail = flow.creating ? (
    <CharacterCreateWizard
      canCreate={Boolean(romWithAssets)}
      createBlank={draft.createNew}
      onUrlImport={actions.handleUrlImport}
      onFileImport={library.importFiles}
      onCancel={flow.cancel}
      onCreated={flow.select}
    />
  ) : workArea;

  return (
    <ListDetailLayout
      listShowTitle={false}
      listContainers={[{ title: 'Sprite library', content: list }]}
      collapsed={flow.listCollapsed}
      onCollapsedChange={flow.setListCollapsed}
      detail={detail}
      emptyDetail={<EmptyState message={EMPTY_EDITOR} />}
      detailScroll={false}
      storageKey="sprite-studio.list"
      listLabel="Sprite Studio"
      detailLabel="sprite editor"
    />
  );
};

export { PlayerSpriteStudio };
