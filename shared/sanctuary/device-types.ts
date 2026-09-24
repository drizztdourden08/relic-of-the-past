/* @layer shared-sanctuary @kind types */
/**
 * A signed-in app instance. The desktop app signs in through the device-code flow and
 * keeps an opaque Bearer token; only its sha256 is stored, and the token is shown once.
 */
const DEVICE_PLATFORMS = ['windows', 'linux', 'mac', 'android'] as const;

type DevicePlatform = (typeof DEVICE_PLATFORMS)[number];

type Device = {
  id: string;
  userId: string;
  /** sha256 of the Bearer token. */
  tokenHash: string;
  /** "Windows · DESKTOP-4F2", from the app at confirm time. */
  label: string;
  platform: DevicePlatform;
  createdAt: number;
  lastSeenAt: number;
  revokedAt: number | null;
};

export { DEVICE_PLATFORMS };
export type { DevicePlatform, Device };
