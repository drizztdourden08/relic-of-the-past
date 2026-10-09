/* @layer hub-core @kind types */
type Caller = { userId: string; via: 'session' | 'device'; deviceId: string | null };

export type { Caller };
