/* @layer site-kit @kind component */
import { useRef } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import maximizeIcon from '@iconify-icons/lucide/maximize-2';
import { Box, Button, Flex, Image, Pressable, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { Video } from '@drizztdourden08/tessera/composites';
import { usePixelArt } from './usePixelArt';
import type { MediaPreviewProps } from './MediaPreview.type';
import './MediaPreview.css';

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
      <Pressable className="media-preview__open" aria-label={`Expand ${name}`} onClick={expand}>
        <Image src={src ?? undefined} alt={name} onLoad={onLoad} data-pixel-art={pixelArt || undefined} className="media-preview__media" />
      </Pressable>
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
export type { MediaPreviewProps } from './MediaPreview.type';
