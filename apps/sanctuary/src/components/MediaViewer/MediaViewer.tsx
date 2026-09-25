/* @layer sanctuary-site @kind component */
/**
 * An image or a video over most of the app, on the modal backdrop. Escape, the close
 * button and a click on the backdrop close it. An image fits the view and toggles to its
 * real size (scrolling when larger); a video starts at the second the preview stood at.
 */
import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Image } from '@ds/primitives/Image';
import { Video } from '@ds/primitives/Video';
import { usePixelArt } from '../MediaPreview/usePixelArt';
import { DialogShell } from '@ds/composites/DialogShell';
import type { MediaKind } from '../../files/media-kind';
import './MediaViewer.css';

type MediaViewerProps = {
  kind: MediaKind;
  src: string;
  name: string;
  /** Where a video starts, in seconds. */
  startAt: number;
  onClose: () => void;
};

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
export type { MediaViewerProps };
