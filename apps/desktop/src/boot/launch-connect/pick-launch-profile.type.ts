/* @layer renderer-app @kind types */
type LaunchMode = 'online' | 'archipelia';

type LaunchProfilePick =
  | { kind: 'use'; profile: Profile }
  | { kind: 'create'; name: string }
  | { kind: 'refuse'; why: string };

export type { LaunchMode, LaunchProfilePick };
