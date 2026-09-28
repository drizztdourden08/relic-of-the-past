/* @layer store-site @kind component */
/**
 * An item's card or banner at its own shape. While the item has none, or the picture fails
 * to load, a placeholder in the item's colour: its stripes, and the kind's icon centred on a
 * soft dark shadow of its own, glowing faintly in that colour.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { Image } from '@ds/primitives/Image';
import type { MediaRef, StoreKind } from '@shared/store/types';
import { mediaUrl } from '../../api/media-url';
import { itemColorStyle } from '../../lib/item-color-style';
import { KIND_ICONS } from '../../lib/kinds';
import './ItemPicture.css';

type ItemPictureProps = {
  picture: MediaRef | null;
  kind: StoreKind;
  /** card is 16:9, banner is 3:1. */
  role?: 'card' | 'banner';
  /** The item's own colour, `#rrggbb`; gold when unset. */
  color?: string;
  className?: string;
};

const ItemPicture = (props: ItemPictureProps) => {
  const { picture, kind, role = 'card', color, className = '' } = props;
  const src = mediaUrl(picture);
  const placeholder = (
    <Box as="span" className="item-picture__placeholder" aria-hidden="true">
      <Box as="span" className="item-picture__shade" />
      <Box as="span" className="item-picture__icon"><IconifyIcon icon={KIND_ICONS[kind]} /></Box>
    </Box>
  );
  return (
    <Box className={`item-picture item-picture--${role}${className ? ` ${className}` : ''}`} style={itemColorStyle(color)}>
      {src ? <Image src={src} alt="" loading="lazy" className="item-picture__image" fallback={placeholder} /> : placeholder}
    </Box>
  );
};

export { ItemPicture };
export type { ItemPictureProps };
