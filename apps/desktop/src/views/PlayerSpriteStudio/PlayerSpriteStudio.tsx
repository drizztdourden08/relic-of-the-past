/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useMemo } from 'react';
import { EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { useCreateFlow } from '@app/hooks/useCreateFlow';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { useConfirmUninstall } from '../InstalledOriginBar';
import { useSpriteLibrary } from './behavior/useSpriteLibrary';
import { useSpriteDraft } from './behavior/useSpriteDraft';
import { useSpriteExport } from './behavior/useSpriteExport';
import { useStudioTask } from './behavior/useStudioTask';
import { useStudioActions } from './behavior/useStudioActions';
import { SpriteListPane } from './sub-components/SpriteListPane';
import { SpriteWorkArea } from './sub-components/SpriteWorkArea';
import { CharacterCreateWizard, NEW_SPRITE_ID } from './sub-components/CharacterCreateWizard';
import type { PlayerSpriteStudioProps } from './PlayerSpriteStudio.type';
import './PlayerSpriteStudio.css';

const PlayerSpriteStudio = (props: PlayerSpriteStudioProps) => {
  const t = useT();
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

  const list = <SpriteListPane flow={flow} library={library} actions={actions} selected={flow.creating ? null : openFile} error={sheet ? null : problem} />;

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
      listContainers={[{ title: t('views-player-sprite-studio:library.title'), content: list }]}
      collapsed={flow.listCollapsed}
      onCollapsedChange={flow.setListCollapsed}
      detail={detail}
      emptyDetail={<EmptyState message={t('views-player-sprite-studio:empty.editor')} />}
      detailScroll={false}
      storageKey="sprite-studio.list"
      listLabel={t('views-player-sprite-studio:list.label')}
      detailLabel={t('views-player-sprite-studio:detail.label')}
    />
  );
};

export { PlayerSpriteStudio };
