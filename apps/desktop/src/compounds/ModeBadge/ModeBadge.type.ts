/* @layer renderer-components @kind types */

type ProfileModeId = 'vanilla' | 'vanilla-safe' | 'randomizer' | 'randomizer-online' | 'randomizer-archipelia';

interface ModeBadgeProps {
  mode: ProfileModeId;
  className?: string;
}

export type { ModeBadgeProps, ProfileModeId };
