/* @layer website-site @kind types */
type Platform = 'windows' | 'mac' | 'linux' | 'unknown';

type NavigatorWithHint = Navigator & { userAgentData?: { platform?: string } };

export type { NavigatorWithHint, Platform };
