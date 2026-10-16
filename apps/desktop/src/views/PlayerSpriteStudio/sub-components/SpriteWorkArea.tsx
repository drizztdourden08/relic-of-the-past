/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { StateList, ViewerStage, useSpriteViewer, useWearing } from '@rotp/design/packs';
import { StudioLayout } from '@drizztdourden08/tessera/composites';
import { STUDIO_EDITOR_MIN_WIDTH, StudioPane, StudioPanelContent } from '@app/studio';
import { InstalledOriginBar } from '../../InstalledOriginBar';
import { buildStudioGroups } from '../behavior/build-studio-groups';
import { PROPERTIES_PANEL, STATES_PANEL } from '../PlayerSpriteStudio.constants';
import type { SpriteWorkAreaProps } from '../PlayerSpriteStudio.type';
import { SpriteProperties } from './SpriteProperties';
import { SpriteStatus } from './SpriteStatus';
import { viewerToolGroups } from '../behavior/viewer-tool-groups';

const SpriteWorkArea = (props: SpriteWorkAreaProps) => {
  const { sheet, installed, busy, error, draft, library, exporter, run, onOpenAfter, onUninstalled } = props;
  const wearing = useWearing();
  const viewer = useSpriteViewer({ setOutfit: wearing.setOutfit });
  const { setAction, setView } = viewer;
  const readOnly = installed !== null;
  const isNew = draft.draft?.file === null;

  const selectState = useCallback((action: number) => {
    setAction(action);
    setView('state');
  }, [setAction, setView]);

  const groups = buildStudioGroups({ sheet, busy, readOnly, dirty: draft.dirty, isNew, draft, library, exporter, run });

  return (
    <StudioPane
      label="Character Studio"
      actions={groups}
      status={(
        <SpriteStatus isNew={isNew} dirty={draft.dirty} applied={draft.applied} readOnly={readOnly} exportStatus={exporter.status} error={error} />
      )}
      banner={installed && (
        <InstalledOriginBar pack={installed} onDuplicated={onOpenAfter} onUpdateInstalled={onOpenAfter} onUninstalled={onUninstalled} />
      )}
    >
      <StudioLayout
        editorLabel="Sprite preview"
        compactToolbar
        editorMinWidth={STUDIO_EDITOR_MIN_WIDTH}
        toolbar={viewerToolGroups({ wearing, viewer })}
        start={{ ...STATES_PANEL, content: <StudioPanelContent><StateList fill selected={viewer.action} onSelect={selectState} /></StudioPanelContent> }}
        end={{
          ...PROPERTIES_PANEL,
          content: (
            <StudioPanelContent>
              <SpriteProperties sheet={sheet} outfit={wearing.outfit} readOnly={readOnly} draft={draft} />
            </StudioPanelContent>
          ),
        }}
      >
        <ViewerStage sheet={sheet} wearing={wearing} viewer={viewer} />
      </StudioLayout>
    </StudioPane>
  );
};

export { SpriteWorkArea };
