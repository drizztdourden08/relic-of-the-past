/* @layer sanctuary-site @kind component */
/**
 * The account entry's icon: the signed-in person's avatar, drawn at the nav's icon
 * size. Without an avatar, or when it fails to load, the section's own icon stands in.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import type { IconifyIcon as IconData } from '@iconify/react/offline';
import { Image } from '@ds/primitives/Image';
import './NavAvatar.css';

type NavAvatarProps = {
  src: string | null;
  fallback: IconData;
};

const NavAvatar = (props: NavAvatarProps) => {
  const { src, fallback } = props;
  const icon = <IconifyIcon icon={fallback} />;
  if (!src) return icon;
  return <Image className="nav-avatar" src={src} alt="" fallback={icon} />;
};

export { NavAvatar };
export type { NavAvatarProps };
