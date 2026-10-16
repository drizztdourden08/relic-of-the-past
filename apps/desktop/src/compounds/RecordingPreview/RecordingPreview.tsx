/* @layer renderer-components @kind component */
import { Box, Image } from '@drizztdourden08/tessera/primitives';
import { Video } from '@drizztdourden08/tessera/composites';
import { useCyclingFrame } from './behavior/useCyclingFrame';
import { NO_FRAMES } from './RecordingPreview.constants';
import type { RecordingPreviewProps } from './RecordingPreview.type';
import './RecordingPreview.css';

const RecordingPreview = (props: RecordingPreviewProps) => {
  const { session, label } = props;
  const { previewKind, previewUrl, previewFrameUrls } = session;
  const frame = useCyclingFrame(previewKind === 'images' ? previewFrameUrls : NO_FRAMES);

  return (
    <Box className="recording-preview">
      {previewKind === 'video' && previewUrl && <Video className="recording-preview__media" src={previewUrl} controls={false} muted loop autoPlay playsInline label={label} />}
      {previewKind === 'images' && frame && <Image className="recording-preview__media" src={frame} alt="" fit="cover" />}
    </Box>
  );
};

export { RecordingPreview };
