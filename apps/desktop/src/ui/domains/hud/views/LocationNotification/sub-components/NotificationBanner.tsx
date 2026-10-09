/* @layer renderer-hud @kind component */
import { useEffect, useState } from 'react';
import { HudBox } from '../../../primitives/HudBox';
import { ANIMATE_IN_MS, ANIMATE_OUT_MS } from '../LocationNotification.constants';
import type { NotificationBannerProps } from '../LocationNotification.type';

const NotificationBanner = ({ title, subtitle, dismissMs, variant }: NotificationBannerProps) => {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase('visible'), ANIMATE_IN_MS);
    const exitTimer = setTimeout(() => setPhase('exit'), dismissMs - ANIMATE_OUT_MS);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [dismissMs]);

  const className = [
    'location-notification-banner',
    `location-notification-banner--${variant}`,
    `location-notification-banner--${phase}`,
  ].join(' ');

  return (
    <HudBox className={className}>
      <HudBox as="span" className="location-notification-title">{title}</HudBox>
      {subtitle && <HudBox as="span" className="location-notification-subtitle">{subtitle}</HudBox>}
    </HudBox>
  );
};

export { NotificationBanner };
