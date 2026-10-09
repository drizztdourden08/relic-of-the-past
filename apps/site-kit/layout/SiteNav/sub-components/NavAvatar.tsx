/* @layer site-kit @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Image } from '@ds/primitives/Image';
import type { NavAvatarProps } from './NavAvatar.type';
import './NavAvatar.css';

const NavAvatar = (props: NavAvatarProps) => {
  const { src, fallback } = props;
  const icon = <IconifyIcon icon={fallback} />;
  if (!src) return icon;
  return <Image className="nav-avatar" src={src} alt="" fallback={icon} />;
};

export { NavAvatar };
