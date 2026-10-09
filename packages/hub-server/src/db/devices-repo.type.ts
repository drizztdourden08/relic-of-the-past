/* @layer hub-core @kind types */
import type { Device } from '@rotp/hub-contracts';

type CodeStatus = 'pending' | 'confirmed' | 'denied';
type DeviceCode = { userCode: string; pollSecretHash: string; expiresAt: number; status: CodeStatus };
type DeviceDoc = Device & { code: DeviceCode | null };

export type { DeviceDoc, DeviceCode, CodeStatus };
