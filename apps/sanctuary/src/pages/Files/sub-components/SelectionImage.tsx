/* @layer sanctuary-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import imageIcon from '@iconify-icons/lucide/image';
import { Image } from '@drizztdourden08/tessera/primitives';
import { usePixelArt } from '@site-kit/components/MediaPreview/usePixelArt';
import { useFilePreview } from '../../../files/useFilePreview';
import type { SelectionImageProps } from './SelectionImage.type';

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
