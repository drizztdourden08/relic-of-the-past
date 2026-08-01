/* @layer renderer-hud @kind component */
/**
 * LocationNotification — renders animated screen/transition banners.
 * Positioned at bottom-center of the game overlay.
 */

import { getLocation } from '@shared/game/data';
import { HudBox } from '../../primitives/HudBox';
import { useLocationNotificationStore } from '../../../../../stores/location-notification-store';
import { SCREEN_DISMISS_MS, TRANSITION_DISMISS_MS } from '../../hooks/useLocationNotification';
import { useEffect, useState } from 'react';

/** Slide-in animation duration */
const ANIMATE_IN_MS = 300;
/** Fade-out duration (overlaps with dismiss) */
const ANIMATE_OUT_MS = 400;

const LocationNotification = () => {
  const screen = useLocationNotificationStore((s) => s.screen);
  const transition = useLocationNotificationStore((s) => s.transition);

  return (
    <HudBox className="location-notification-container">
      {screen && (
        <NotificationBanner
          key={`screen-${screen.timestamp}`}
          title={getLocation(screen.screen.locationId).randomizerName}
          subtitle={screen.screen.vanillaName ?? screen.screen.randomizerName}
          dismissMs={SCREEN_DISMISS_MS}
          variant="screen"
        />
      )}
      {transition && (
        <NotificationBanner
          key={`transition-${transition.timestamp}`}
          title={transition.entrance}
          dismissMs={TRANSITION_DISMISS_MS}
          variant="transition"
        />
      )}
    </HudBox>
  );
};

interface NotificationBannerProps {
  title: string;
  subtitle?: string;
  dismissMs: number;
  variant: 'screen' | 'transition';
}

const NotificationBanner = ({ title, subtitle, dismissMs, variant }: NotificationBannerProps) => {
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    // Enter → visible
    const enterTimer = setTimeout(() => setPhase('visible'), ANIMATE_IN_MS);
    // Visible → exit (before auto-dismiss clears the store)
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

export { LocationNotification };
