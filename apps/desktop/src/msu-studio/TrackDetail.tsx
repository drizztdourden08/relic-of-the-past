/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { StudioSection } from '@app/studio';
import { CloseDetailButton } from './CloseDetailButton';
import { LayerEditor } from './LayerEditor';
import { PreviewReadout } from './PreviewReadout';
import { TrackActions } from './TrackActions';
import { TrackFileField } from './TrackFileField';
import { trackTarget } from './behavior/layer-target';
import { trackPreviewKey } from './behavior/preview-key';
import type { TrackDetailProps } from './TrackDetail.type';

const TrackDetail = (props: TrackDetailProps) => {
  const { msu, pack, row, readOnly, controls, onClose, onConfirm } = props;
  const { trackNum, description, fileName } = row;
  const t = useT();
  const target = trackTarget(t, trackNum);

  return (
    <>
      <StudioSection title={`#${trackNum} ${description}`} action={<CloseDetailButton label={t('msu-studio:track.close', { number: trackNum })} onClose={onClose} />}>
        <TrackActions trackNum={trackNum} hasAudio={fileName !== null} controls={controls} />
        {controls.playing === trackNum && (
          <PreviewReadout store={msu.reportStore} previewKey={trackPreviewKey(trackNum)} label={t('msu-studio:track.label', { number: trackNum })} />
        )}
      </StudioSection>

      <StudioSection title={t('msu-studio:track.file.label')}>
        <TrackFileField
          trackNum={trackNum}
          fileName={fileName}
          fileSize={msu.files.find((file) => file.name === fileName)?.size}
          options={msu.fileOptions}
          busy={msu.busy}
          readOnly={readOnly}
          onAssign={msu.handleTrackAssign}
        />
      </StudioSection>

      <LayerEditor
        key={`${pack}:${target.previewKey}`}
        pack={pack}
        target={target}
        manifest={msu.resolved}
        saveBase={msu.manifest ?? msu.resolved}
        availableFiles={msu.files.map((file) => file.name)}
        isLayered={msu.format === 'layered'}
        reportStore={msu.reportStore}
        onConfirm={onConfirm}
        onSaved={msu.reload}
        readOnly={readOnly}
      />
    </>
  );
};

export { TrackDetail };
