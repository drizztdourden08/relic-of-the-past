/* @layer store-site @kind component */
/**
 * An item's card or banner at its own shape, or the kind's icon on a dark well while the
 * item has none or the picture fails to load.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { Image } from '@ds/primitives/Image';
import type { MediaRef, StoreKind } from '@shared/store/types';
import { mediaUrl } from '../../api/media-url';
import { KIND_ICONS } from '../../lib/kinds';
import './ItemPicture.css';

type ItemPictureProps = {
  picture: MediaRef | null;
  kind: StoreKind;
  /** card is 16:9, banner is 16:5. */
  role?: 'card' | 'banner';
  className?: string;
};

const ItemPicture = (props: ItemPictureProps) => {
  const { picture, kind, role = 'card', className = '' } = props;
  const src = mediaUrl(picture);
  const icon = <Box as="span" className="item-picture__icon" aria-hidden="true"><IconifyIcon icon={KIND_ICONS[kind]} /></Box>;
  return (
    <Box className={`item-picture item-picture--${role}${className ? ` ${className}` : ''}`}>
      {src ? <Image src={src} alt="" loading="lazy" className="item-picture__image" fallback={icon} /> : icon}
    </Box>
  );
};

export { ItemPicture };
export type { ItemPictureProps };
