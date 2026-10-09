/* @layer shared-platform @kind types */
interface CapacitorGlobal {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
}

export type { CapacitorGlobal };
