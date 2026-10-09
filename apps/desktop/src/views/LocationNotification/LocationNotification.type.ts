/* @layer renderer-hud @kind types */
interface NotificationBannerProps {
  title: string;
  subtitle?: string;
  dismissMs: number;
  variant: 'screen' | 'transition';
}

export type { NotificationBannerProps };
