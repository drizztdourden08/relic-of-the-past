/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { StateList, ViewerStage, useSpriteViewer, useWearing } from '@rotp/design/packs';
import { StudioBody, StudioPane } from '@app/studio';
import { InstalledOriginBar } from '../../InstalledOriginBar';
import { buildStudioGroups } from '../behavior/build-studio-groups';
import { PROPERTIES_PANEL, STATES_PANEL } from '../PlayerSpriteStudio.constants';
import type { SpriteWorkAreaProps } from '../PlayerSpriteStudio.type';
import { SpriteProperties } from './SpriteProperties';
import { SpriteStatus } from './SpriteStatus';
import { ViewerToolbar } from './ViewerToolbar';

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
      <StudioBody
        editorLabel="Sprite preview"
        toolbar={<ViewerToolbar wearing={wearing} viewer={viewer} />}
        start={{ ...STATES_PANEL, content: <StateList fill selected={viewer.action} onSelect={selectState} /> }}
        end={{ ...PROPERTIES_PANEL, content: <SpriteProperties sheet={sheet} outfit={wearing.outfit} readOnly={readOnly} draft={draft} /> }}
      >
        <ViewerStage sheet={sheet} wearing={wearing} viewer={viewer} />
      </StudioBody>
    </StudioPane>
  );
};

export { SpriteWorkArea };
