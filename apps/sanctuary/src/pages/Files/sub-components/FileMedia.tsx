/* @layer sanctuary-site @kind component */
import { useMemo, useRef, useState } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import maximizeIcon from '@iconify-icons/lucide/maximize-2';
import { Box, Button, Flex, Image, Pressable, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { MediaViewer, Video } from '@drizztdourden08/tessera/composites';
import { usePixelArt } from '@rotp/design';
import { useFilePreview } from '../../../files/useFilePreview';
import type { FileMediaProps } from './FileMedia.type';
import './FileMedia.css';

const FileMedia = (props: FileMediaProps) => {
  const { file, kind } = props;
  const { url, error } = useFilePreview(file.id, file.currentVersion);
  const { pixelArt, onLoad } = usePixelArt();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [viewerOpenAtSecond, setViewerOpenAtSecond] = useState<number | null>(null);
  const items = useMemo(() => (url ? [{ id: file.id, kind, src: url, name: file.name }] : []), [file.id, file.name, kind, url]);

  const expand = () => {
    const video = videoRef.current;
    video?.pause();
    setViewerOpenAtSecond(video?.currentTime ?? 0);
  };

  const media = kind === 'image'
    ? (
      <Pressable className="file-media__open" aria-label={`Expand ${file.name}`} onClick={expand}>
        <Image src={url ?? undefined} alt={file.name} onLoad={onLoad} data-pixel-art={pixelArt || undefined} className="file-media__media" />
      </Pressable>
    )
    : <Video ref={videoRef} src={url ?? undefined} controls preload="metadata" className="file-media__media file-media__media--video" />;

  return (
    <>
      <Stack gap="xs" align="stretch" className="file-media">
        <Box className="file-media__frame">
          {url
            ? media
            : <Text as="span" variant="caption" role={error ? 'alert' : 'status'}>{error ?? 'Loading preview...'}</Text>}
        </Box>
        <Flex justify="end">
          <Button variant="secondary" size="sm" icon={<IconifyIcon icon={maximizeIcon} />} disabled={!url} onClick={expand}>
            Expand
          </Button>
        </Flex>
      </Stack>
      <MediaViewer
        open={url !== null && viewerOpenAtSecond !== null}
        items={items}
        startAt={viewerOpenAtSecond ?? 0}
        onClose={() => setViewerOpenAtSecond(null)}
      />
    </>
  );
};

export { FileMedia };
