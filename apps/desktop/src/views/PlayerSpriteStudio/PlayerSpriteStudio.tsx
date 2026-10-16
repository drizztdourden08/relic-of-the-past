/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { useSpriteViewer, useWearing } from '@rotp/design/packs';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { StudioFrame } from '../../compounds/StudioFrame';
import { InstalledOriginBar, useConfirmUninstall } from '../InstalledOriginBar';
import { useSpriteLibrary } from './behavior/useSpriteLibrary';
import { useSpriteDraft } from './behavior/useSpriteDraft';
import { useSpriteExport } from './behavior/useSpriteExport';
import { useStudioTask } from './behavior/useStudioTask';
import { useStudioActions } from './behavior/useStudioActions';
import { buildStudioGroups } from './behavior/build-studio-groups';
import { titleOf } from './behavior/title-of';
import { viewerToolbar } from './behavior/viewer-toolbar';
import { SpriteDetailsPanel } from './sub-components/SpriteDetailsPanel';
import { SpriteLibraryList } from './sub-components/SpriteLibraryList';
import { SpriteNotices } from './sub-components/SpriteNotices';
import { SpriteStatus } from './sub-components/SpriteStatus';
import { SpriteWorkspace } from './sub-components/SpriteWorkspace';
import { IDLE_HINT } from './PlayerSpriteStudio.constants';
import type { PlayerSpriteStudioProps } from './PlayerSpriteStudio.type';
import './PlayerSpriteStudio.css';

const PlayerSpriteStudio = (props: PlayerSpriteStudioProps) => {
  const { romStatuses, onDeleteConfirm } = props;

  const romWithAssets = useMemo(() => romStatuses.find((r) => r.hasAssets)?.romFile ?? null, [romStatuses]);
  const library = useSpriteLibrary();
  const draft = useSpriteDraft(romWithAssets);
  const wearing = useWearing();
  const viewer = useSpriteViewer({ setOutfit: wearing.setOutfit });
  const exporter = useSpriteExport();
  const { busy, error, run } = useStudioTask();

  const sheet = draft.draft?.sheet ?? null;
  const openFile = draft.draft?.file ?? null;
  const { pack: installed, packFor } = useInstalledKind('character', openFile);
  const { confirmUninstall, uninstallError } = useConfirmUninstall(onDeleteConfirm);
  const actions = useStudioActions({ openFile, packFor, confirmUninstall, onDeleteConfirm, run, library, draft });
  const readOnly = installed !== null;

  const groups = buildStudioGroups({
    sheet, canCreate: Boolean(romWithAssets), busy, readOnly, dirty: draft.dirty, isNew: openFile === null, draft, library, exporter, run,
  });

  return (
    <StudioFrame
      caption="Character Studio"
      title={titleOf(sheet)}
      status={<SpriteStatus open={sheet !== null} file={openFile} dirty={draft.dirty} applied={draft.applied} readOnly={readOnly} />}
      groups={groups}
      idleHint={IDLE_HINT}
      notices={<SpriteNotices applied={draft.applied} readOnly={readOnly} exportStatus={exporter.status} error={error ?? uninstallError} />}
      banner={installed && (
        <InstalledOriginBar pack={installed} onDuplicated={actions.openAfter} onUpdateInstalled={actions.openAfter} onUninstalled={actions.handleUninstalled} />
      )}
      left={{
        title: 'Sprites',
        content: (
          <SpriteLibraryList
            entries={library.entries}
            loading={library.loading}
            selected={openFile}
            isInstalled={actions.isInstalled}
            onSelect={(name) => run(() => draft.open(name))}
            onDelete={actions.handleDelete}
            onUrlImport={actions.handleUrlImport}
            onFileImport={library.importFiles}
          />
        ),
      }}
      right={{ title: 'Details', content: <SpriteDetailsPanel sheet={sheet} outfit={wearing.outfit} readOnly={readOnly} draft={draft} /> }}
      editorLabel="Sprite editor"
      toolbar={viewerToolbar({ open: sheet !== null, wearing, viewer })}
    >
      <SpriteWorkspace sheet={sheet} wearing={wearing} viewer={viewer} />
    </StudioFrame>
  );
};

export { PlayerSpriteStudio };
