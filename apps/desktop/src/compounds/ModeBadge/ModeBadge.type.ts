/* @layer renderer-components @kind types */

type ProfileModeId = 'vanilla' | 'vanilla-safe' | 'randomizer' | 'randomizer-online';

interface ModeBadgeProps {
  mode: ProfileModeId;
  className?: string;
}

export type { ModeBadgeProps, ProfileModeId };
