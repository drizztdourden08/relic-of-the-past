/* @layer sanctuary-site @kind component */
/**
 * The picture of an image file in a selection tile, read through the preview route. A
 * small image (a sprite) is drawn with hard pixel edges, as in the file's own preview.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import imageIcon from '@iconify-icons/lucide/image';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { Image } from '@ds/primitives/Image';
import { usePixelArt } from '../../../components/MediaPreview/usePixelArt';
import { useFilePreview } from '../../../files/useFilePreview';

type SelectionImageProps = {
  file: SanctuaryFile;
};

const SelectionImage = (props: SelectionImageProps) => {
  const { file } = props;
  const { url } = useFilePreview(file.id, file.currentVersion);
  const { pixelArt, onLoad } = usePixelArt();
  const placeholder = <IconifyIcon icon={imageIcon} className="selection-tile__icon" />;

  if (!url) return placeholder;
  return (
    <Image
      src={url}
      alt={file.name}
      loading="lazy"
      onLoad={onLoad}
      fallback={placeholder}
      data-pixel-art={pixelArt || undefined}
      className="selection-tile__image"
    />
  );
};

export { SelectionImage };
export type { SelectionImageProps };
