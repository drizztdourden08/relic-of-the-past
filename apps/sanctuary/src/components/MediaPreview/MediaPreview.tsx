/* @layer sanctuary-site @kind component */
/**
 * An image or a video shown in place, fitted to the panel width under a height cap, with
 * an Expand button. Clicking the image expands it too. A video is paused on expand and
 * hands its current time over, so the viewer carries on from the same frame.
 */
import { useRef } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import maximizeIcon from '@iconify-icons/lucide/maximize-2';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Image } from '@ds/primitives/Image';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { Video } from '@ds/primitives/Video';
import { usePixelArt } from './usePixelArt';
import type { MediaKind } from '../../files/media-kind';
import './MediaPreview.css';

type MediaPreviewProps = {
  kind: MediaKind;
  /** The inline link; null while it loads or when it failed. */
  src: string | null;
  /** The file name, for the image's alt text and the expand label. */
  name: string;
  error: string | null;
  /** Opens the viewer; a video passes the second it stood at. */
  onExpand: (startAt: number) => void;
};

const MediaPreview = (props: MediaPreviewProps) => {
  const { kind, src, name, error, onExpand } = props;
  const { pixelArt, onLoad } = usePixelArt();
  const videoRef = useRef<HTMLVideoElement>(null);

  const expand = () => {
    const video = videoRef.current;
    video?.pause();
    onExpand(video?.currentTime ?? 0);
  };

  const media = kind === 'image'
    ? (
      <Button variant="bare" className="media-preview__open" aria-label={`Expand ${name}`} onClick={expand}>
        <Image src={src ?? undefined} alt={name} onLoad={onLoad} data-pixel-art={pixelArt || undefined} className="media-preview__media" />
      </Button>
    )
    : <Video ref={videoRef} src={src ?? undefined} controls preload="metadata" className="media-preview__media media-preview__media--video" />;

  return (
    <Stack gap="xs" align="stretch" className="media-preview">
      <Box className="media-preview__frame">
        {src
          ? media
          : <Text as="span" variant="caption" role={error ? 'alert' : 'status'}>{error ?? 'Loading preview...'}</Text>}
      </Box>
      <Flex justify="end">
        <Button variant="secondary" size="sm" icon={<IconifyIcon icon={maximizeIcon} />} disabled={!src} onClick={expand}>
          Expand
        </Button>
      </Flex>
    </Stack>
  );
};

export { MediaPreview };
export type { MediaPreviewProps };
