/* @layer hub-core @kind types */
type Session = { userId: string; v: number };

type UnverifiedSessionClaims = { userId?: unknown; v?: unknown };

export type { Session, UnverifiedSessionClaims };
