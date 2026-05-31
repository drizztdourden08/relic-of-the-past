/**
 * LocationNotification — renders animated screen/transition banners.
 * Positioned at bottom-center of the game overlay.
 */

import { useLocationNotificationStore } from '../../../stores/location-notification-store';
import { SCREEN_DISMISS_MS, TRANSITION_DISMISS_MS } from '../../hooks/useLocationNotification';
import { useEffect, useState } from 'react';

/** Slide-in animation duration */
const ANIMATE_IN_MS = 300;
/** Fade-out duration (overlaps with dismiss) */
const ANIMATE_OUT_MS = 400;

function LocationNotification() {
  const screen = useLocationNotificationStore((s) => s.screen);
  const transition = useLocationNotificationStore((s) => s.transition);

  return (
    <div className="location-notification-container">
      {screen && (
        <NotificationBanner
          key={`screen-${screen.timestamp}`}
          title={screen.screen.location}
          subtitle={screen.screen.name}
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
    </div>
  );
}

interface NotificationBannerProps {
  title: string;
  subtitle?: string;
  dismissMs: number;
  variant: 'screen' | 'transition';
}

function NotificationBanner({ title, subtitle, dismissMs, variant }: NotificationBannerProps) {
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
    <div className={className}>
      <span className="location-notification-title">{title}</span>
      {subtitle && <span className="location-notification-subtitle">{subtitle}</span>}
    </div>
  );
}

export { LocationNotification };
