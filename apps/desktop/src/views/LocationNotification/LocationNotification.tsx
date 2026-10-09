/* @layer renderer-hud @kind component */
import { getLocation } from '@rotp/game-data';
import { HudBox } from '../../primitives/HudBox';
import { useLocationNotificationStore } from '../../stores/location-notification-store';
import { SCREEN_DISMISS_MS, TRANSITION_DISMISS_MS } from '../../hooks/hooks.constants';
import { NotificationBanner } from './sub-components/NotificationBanner';

const LocationNotification = () => {
  const screen = useLocationNotificationStore((s) => s.screen);
  const transition = useLocationNotificationStore((s) => s.transition);

  return (
    <HudBox className="location-notification-container">
      {screen && (
        <NotificationBanner
          key={`screen-${screen.timestamp}`}
          title={getLocation(screen.screen.locationId).name}
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
    </HudBox>
  );
};

export { LocationNotification };
