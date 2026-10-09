/* @layer site-kit @kind component */
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Box, Button, Image } from '@drizztdourden08/tessera/primitives';
import { usePixelArt } from '../MediaPreview/usePixelArt';
import { DialogShell, Video } from '@drizztdourden08/tessera/composites';
import type { MediaViewerProps } from './MediaViewer.type';
import './MediaViewer.css';

const MediaViewer = (props: MediaViewerProps) => {
  const { kind, src, name, startAt, onClose } = props;
  const [actualSize, setActualSize] = useState(false);
  const { pixelArt, onLoad } = usePixelArt();

  const seek = (event: SyntheticEvent<HTMLVideoElement>) => {
    if (startAt > 0) event.currentTarget.currentTime = startAt;
  };

  const zoom = kind === 'image' && (
    <Button variant="secondary" size="sm" active={actualSize} onClick={() => setActualSize((on) => !on)}>
      {actualSize ? 'Fit to view' : '100%'}
    </Button>
  );

  return (
    <DialogShell open title={name} headerExtra={zoom} onClose={onClose} className="media-viewer">
      <Box className="media-viewer__stage" data-zoom={actualSize ? 'actual' : 'fit'}>
        {kind === 'image'
          ? <Image src={src} alt={name} onLoad={onLoad} data-pixel-art={pixelArt || undefined} className="media-viewer__media" />
          : <Video src={src} controls autoPlay onLoadedMetadata={seek} className="media-viewer__media media-viewer__media--video" />}
      </Box>
    </DialogShell>
  );
};

export { MediaViewer };
export type { MediaViewerProps } from './MediaViewer.type';
