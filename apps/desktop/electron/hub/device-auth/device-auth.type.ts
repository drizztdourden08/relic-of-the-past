/* @layer electron-main @kind types */
type BeginResponse = { deviceId: string; userCode: string; verifyUrl: string; pollSecret: string };
type PollResponse = { status: 'pending' | 'confirmed' | 'denied' | 'expired' | 'used'; token?: string };

export type { BeginResponse, PollResponse };
