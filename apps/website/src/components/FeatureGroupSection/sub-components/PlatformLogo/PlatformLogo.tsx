/* @layer website-site @kind component */
import { Svg, SvgPath } from '../../../../design';
import { PLATFORM_LOGO_PATHS, PLATFORM_LOGO_VIEW_BOX } from './PlatformLogo.constants';
import type { PlatformLogoProps } from './PlatformLogo.type';
import './PlatformLogo.css';

const PlatformLogo = ({ logo }: PlatformLogoProps) => (
  <Svg viewBox={PLATFORM_LOGO_VIEW_BOX} fill="currentColor" aria-hidden="true" className="platform-logo">
    <SvgPath d={PLATFORM_LOGO_PATHS[logo]} fillRule="evenodd" />
  </Svg>
);

export { PlatformLogo };
