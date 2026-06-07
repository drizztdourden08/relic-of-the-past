/* @layer shared-input @kind types */
/**
 * Shared TypeScript types for the input layer.
 */

interface DeviceDatabaseEntry {
  name: string;
  platforms: ('windows' | 'mac' | 'linux')[];
  vidPid?: string;
  hasGyro: boolean;
  /** Button-type inputs (digital) */
  buttons?: string[];
  /** Axis-type inputs (analog) */
  axes?: string[];
}

export type { DeviceDatabaseEntry };
