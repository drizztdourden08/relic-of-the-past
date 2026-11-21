/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useCallback, useMemo } from 'react';
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
import { viewerLabelsOf } from '../behavior/viewer-labels-of';

const SpriteWorkArea = (props: SpriteWorkAreaProps) => {
  const { sheet, installed, busy, error, draft, library, exporter, run, onOpenAfter, onUninstalled } = props;
  const t = useT();
  const labels = useMemo(() => viewerLabelsOf(t), [t]);
  const wearing = useWearing();
  const viewer = useSpriteViewer({ setOutfit: wearing.setOutfit });
  const { setAction, setView } = viewer;
  const readOnly = installed !== null;
  const isNew = draft.draft?.file === null;

  const selectState = useCallback((action: number) => {
    setAction(action);
    setView('state');
  }, [setAction, setView]);

  const groups = buildStudioGroups({ sheet, busy, readOnly, dirty: draft.dirty, isNew, draft, library, exporter, run, t });

  return (
    <StudioPane
      label={t('views-player-sprite-studio:studio.label')}
      actions={groups}
      status={(
        <SpriteStatus isNew={isNew} dirty={draft.dirty} applied={draft.applied} readOnly={readOnly} exportStatus={exporter.status} error={error} />
      )}
      banner={installed && (
        <InstalledOriginBar pack={installed} onDuplicated={onOpenAfter} onUpdateInstalled={onOpenAfter} onUninstalled={onUninstalled} />
      )}
    >
      <StudioLayout
        editorLabel={t('views-player-sprite-studio:studio.previewLabel')}
        compactToolbar
        editorMinWidth={STUDIO_EDITOR_MIN_WIDTH}
        toolbar={viewerToolGroups({ wearing, viewer, t })}
        start={{ ...STATES_PANEL, title: t('views-player-sprite-studio:panel.states'), content: <StudioPanelContent><StateList fill selected={viewer.action} onSelect={selectState} labels={labels} /></StudioPanelContent> }}
        end={{
          ...PROPERTIES_PANEL,
          title: t('views-player-sprite-studio:panel.properties'),
          content: (
            <StudioPanelContent>
              <SpriteProperties sheet={sheet} outfit={wearing.outfit} readOnly={readOnly} draft={draft} />
            </StudioPanelContent>
          ),
        }}
      >
        <ViewerStage sheet={sheet} wearing={wearing} viewer={viewer} labels={labels} />
      </StudioLayout>
    </StudioPane>
  );
};

export { SpriteWorkArea };
